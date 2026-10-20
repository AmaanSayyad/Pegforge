"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import {
  getBlock,
  readContract,
  waitForTransactionReceipt,
} from "wagmi/actions";
import {
  BaseError,
  ContractFunctionRevertedError,
  decodeEventLog,
  formatUnits,
  maxUint256,
  parseUnits,
  type Hex,
  type TransactionReceipt,
} from "viem";
import {
  DESK_LIQUIDITY_RESERVE,
  type CollateralAsset,
} from "@/lib/assets";
import {
  assetIdBytes,
  bridgeStepLabels,
  hydrateRoute,
  MEZO_DEST_CHAIN_ID,
  routeFor,
  type BridgeStep,
  type SourceLockProof,
} from "@/lib/bridge";
import { mezoTestnet } from "@/lib/chains";
import {
  erc20Abi,
  MUSD_ADDRESS,
  PEGORGE_PORTAL_ADDRESS,
  portalAbi,
  rwaMarketAbi,
  RWA_MARKET_ADDRESS,
  sourceVaultAbi,
} from "@/lib/contracts";
import { pushActivity } from "@/lib/activity";
import { wagmiConfig } from "@/lib/wagmi";

const MARKET = RWA_MARKET_ADDRESS[mezoTestnet.id];
const MUSD = MUSD_ADDRESS[mezoTestnet.id];

function friendlyError(e: unknown): string {
  if (e instanceof BaseError) {
    const revert = e.walk((err) => err instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName;
      if (name === "Undercollateralized") {
        return "Borrow too high for this collateral (over max LTV). Lower the MUSD amount.";
      }
      if (name === "NotListed") {
        return "This asset is not listed on the Mezo market yet.";
      }
      if (name === "BadAmount") return "Invalid amount.";
    }
    const raw = e.shortMessage || e.message;
    if (/nonce too low/i.test(raw) || /nonce too high/i.test(raw)) {
      return "Wallet nonce is out of sync with Sepolia/Base. In MetaMask: Settings → Advanced → Clear activity / reset account (for this account), wait for pending txs to finish, then retry the step.";
    }
    if (/execution reverted/i.test(raw) || /unknown reason/i.test(raw)) {
      return "Borrow reverted - usually the desk is out of MUSD liquidity. Check Pools, refill the market, or borrow a smaller amount.";
    }
    return raw;
  }
  if (e instanceof Error) return e.message;
  return "Transaction failed";
}

async function marketMusdLiquidity(): Promise<bigint> {
  if (!MARKET) return 0n;
  return (await readContract(wagmiConfig, {
    address: MUSD,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [MARKET],
    chainId: mezoTestnet.id,
  })) as bigint;
}

/** Default: Mezo-only express (≈3 MetaMask pops). Full = Sepolia/Base source + Mezo. */
export type BridgeMode = "express" | "full";

export function useBridgeFlow(asset: CollateralAsset, units: string) {
  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, data: txHash, isPending, reset } =
    useWriteContract();

  const route = useMemo(() => hydrateRoute(routeFor(asset)), [asset]);
  const [mode, setMode] = useState<BridgeMode>("express");
  const [step, setStep] = useState<BridgeStep>("connect");
  const [lockProof, setLockProof] = useState<SourceLockProof | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ n: 0, of: 0, label: "" });

  const amountWei = useMemo(() => {
    try {
      return parseUnits(units || "0", 18);
    } catch {
      return 0n;
    }
  }, [units]);

  const push = useCallback((msg: string) => {
    setLog((prev) => [...prev.slice(-10), msg]);
  }, []);

  const ensureChain = useCallback(
    async (id: number) => {
      if (chainId === id) return;
      push(
        id === mezoTestnet.id
          ? "Switch MetaMask to Mezo testnet…"
          : `Switch MetaMask to ${route.sourceChainName}…`,
      );
      await switchChainAsync({ chainId: id });
    },
    [chainId, push, route.sourceChainName, switchChainAsync],
  );

  const sendAndWait = useCallback(
    async (
      label: string,
      write: () => Promise<Hex>,
      activity?: Parameters<typeof pushActivity>[0],
    ): Promise<{ hash: Hex; receipt: TransactionReceipt }> => {
      push(label);
      const hash = await write();
      if (activity) pushActivity({ ...activity, hash });
      push("Waiting for confirmation…");
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        confirmations: 1,
      });
      // Brief pause so MetaMask / Infura nonce trackers catch up before the next hop
      await new Promise((r) => setTimeout(r, 800));
      return { hash, receipt };
    },
    [push],
  );

  const parseSourceLock = useCallback(
    async (receipt: TransactionReceipt): Promise<SourceLockProof | null> => {
      for (const logItem of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: sourceVaultAbi,
            data: logItem.data,
            topics: logItem.topics,
          });
          if (decoded.eventName !== "Locked") continue;
          const args = decoded.args as {
            token: `0x${string}`;
            amount: bigint;
            lockId: Hex;
          };
          const block = await getBlock(wagmiConfig, {
            blockNumber: receipt.blockNumber,
            chainId: route.sourceChainId,
          });
          return {
            lockId: args.lockId,
            sourceToken: args.token,
            amount: args.amount,
            sourceChainId: route.sourceChainId,
            sourceBlock: receipt.blockNumber,
            sourceTime: block.timestamp,
          };
        } catch {
          // not our event
        }
      }
      return null;
    },
    [route.sourceChainId],
  );

  /** One MetaMask confirm: Portal.expressLoan (wrap + deposit + borrow). */
  const runExpress = useCallback(
    async (borrowMusd: string) => {
      setError(null);
      if (!address) throw new Error("Connect wallet first");
      if (amountWei <= 0n) throw new Error("Enter amount");
      if (!PEGORGE_PORTAL_ADDRESS) {
        throw new Error("Portal not deployed. Set NEXT_PUBLIC_PEGORGE_PORTAL.");
      }
      const token = route.mezoToken;
      if (!token || !MARKET) {
        throw new Error(
          "Mezo token / market missing. Set NEXT_PUBLIC_MEZO_TOKEN_* and NEXT_PUBLIC_RWA_MARKET.",
        );
      }
      const musdWei = parseUnits(borrowMusd || "0", 18);
      if (musdWei <= 0n) throw new Error("Enter borrow amount");

      const liquidity = await marketMusdLiquidity();
      const usable =
        liquidity > BigInt(DESK_LIQUIDITY_RESERVE) * 10n ** 18n
          ? liquidity - BigInt(DESK_LIQUIDITY_RESERVE) * 10n ** 18n
          : 0n;
      if (musdWei > usable) {
        const avail = Number(formatUnits(usable, 18)).toFixed(2);
        throw new Error(
          `Usable desk liquidity is ${avail} MUSD (keeps ${DESK_LIQUIDITY_RESERVE} in reserve). Borrow ≤ ${avail}, or refill the market.`,
        );
      }

      setBusy(true);
      try {
        await ensureChain(mezoTestnet.id);
        setStep("borrow");
        setProgress({ n: 1, of: 1, label: "Express loan" });
        await sendAndWait(
          `MetaMask: wrap ${asset.ticker} + borrow ${borrowMusd} MUSD (1 confirm)`,
          () =>
            writeContractAsync({
              address: PEGORGE_PORTAL_ADDRESS,
              abi: portalAbi,
              functionName: "expressLoan",
              args: [
                assetIdBytes(asset.id),
                amountWei,
                musdWei,
                BigInt(route.sourceChainId),
              ],
              chainId: mezoTestnet.id,
            }),
          {
            kind: "borrow",
            title: `Borrow ${borrowMusd} MUSD`,
            detail: `Express wrap + deposit ${asset.ticker}`,
            chainId: mezoTestnet.id,
            assetId: asset.id,
            amount: borrowMusd,
          },
        );

        pushActivity({
          kind: "wrap",
          title: `Wrap ${asset.ticker} on Mezo`,
          detail: "Express (minted into market)",
          chainId: mezoTestnet.id,
          assetId: asset.id,
        });
        pushActivity({
          kind: "deposit",
          title: `Deposit ${asset.ticker}`,
          detail: "Express",
          chainId: mezoTestnet.id,
          assetId: asset.id,
        });

        setStep("done");
        setProgress({ n: 1, of: 1, label: "Done" });
        push("Done - one confirm. MUSD is in your wallet.");
      } finally {
        setBusy(false);
      }
    },
    [
      address,
      amountWei,
      asset.id,
      asset.ticker,
      ensureChain,
      push,
      route.mezoToken,
      route.sourceChainId,
      sendAndWait,
      writeContractAsync,
    ],
  );

  const runSourceMint = useCallback(async () => {
    setError(null);
    if (!address) throw new Error("Connect wallet first");
    if (amountWei <= 0n) throw new Error("Enter amount");
    await ensureChain(route.sourceChainId);
    if (!route.sourceToken) {
      push(
        `No source token on ${route.sourceChainName} - use Express (Mezo-only) instead.`,
      );
      setStep("mezo_wrap");
      return;
    }
    await sendAndWait(
      `Mint ${asset.ticker} on ${route.sourceChainName}`,
      () =>
        writeContractAsync({
          address: route.sourceToken!,
          abi: erc20Abi,
          functionName: "mint",
          args: [address, amountWei],
          chainId: route.sourceChainId,
        }),
      {
        kind: "mint",
        title: `Mint ${asset.ticker}`,
        detail: route.sourceChainName,
        chainId: route.sourceChainId,
        assetId: asset.id,
      },
    );
    setStep("source_approve");
  }, [
    address,
    amountWei,
    asset.id,
    asset.ticker,
    ensureChain,
    push,
    route,
    sendAndWait,
    writeContractAsync,
  ]);

  const runSourceApprove = useCallback(async () => {
    setError(null);
    if (!route.sourceToken || !route.sourceVault) {
      setStep("mezo_wrap");
      return;
    }
    await ensureChain(route.sourceChainId);
    const allowance = (await readContract(wagmiConfig, {
      address: route.sourceToken,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address!, route.sourceVault],
      chainId: route.sourceChainId,
    })) as bigint;
    if (allowance >= amountWei) {
      push("Source vault already approved - skipped.");
      setStep("source_lock");
      return;
    }
    await sendAndWait(
      "Approve source vault",
      () =>
        writeContractAsync({
          address: route.sourceToken!,
          abi: erc20Abi,
          functionName: "approve",
          args: [route.sourceVault!, maxUint256],
          chainId: route.sourceChainId,
        }),
      {
        kind: "approve",
        title: `Approve ${asset.ticker} vault`,
        chainId: route.sourceChainId,
        assetId: asset.id,
      },
    );
    setStep("source_lock");
  }, [
    address,
    amountWei,
    asset.id,
    asset.ticker,
    ensureChain,
    push,
    route,
    sendAndWait,
    writeContractAsync,
  ]);

  const runSourceLock = useCallback(async () => {
    setError(null);
    if (!route.sourceToken || !route.sourceVault || !address) {
      throw new Error(
        "Source vault/token missing for this asset. Use Express, or set SOURCE_TOKEN / SOURCE_VAULT.",
      );
    }
    await ensureChain(route.sourceChainId);
    const { receipt } = await sendAndWait(
      `Lock ${asset.ticker} on ${route.sourceChainName}`,
      () =>
        writeContractAsync({
          address: route.sourceVault!,
          abi: sourceVaultAbi,
          functionName: "lock",
          args: [route.sourceToken!, amountWei, BigInt(MEZO_DEST_CHAIN_ID)],
          chainId: route.sourceChainId,
        }),
      {
        kind: "lock",
        title: `Lock ${asset.ticker}`,
        detail: route.sourceChainName,
        chainId: route.sourceChainId,
        assetId: asset.id,
      },
    );
    const proof = await parseSourceLock(receipt);
    if (!proof) {
      throw new Error(
        "Locked on source, but could not read lockId from the receipt. Retry lock.",
      );
    }
    setLockProof(proof);
    push(`Lock proof saved · ${proof.lockId.slice(0, 10)}…`);
    setStep("mezo_wrap");
  }, [
    address,
    amountWei,
    asset.id,
    asset.ticker,
    ensureChain,
    parseSourceLock,
    push,
    route,
    sendAndWait,
    writeContractAsync,
  ]);

  /** Full bridge Mezo leg: claim real source lockId → wrap into market → borrow (1 tx). */
  const runMezoWrap = useCallback(
    async (borrowMusd: string) => {
      setError(null);
      if (!PEGORGE_PORTAL_ADDRESS) {
        throw new Error(
          "Portal not deployed. Set NEXT_PUBLIC_PEGORGE_PORTAL after deploy.",
        );
      }
      if (!lockProof) {
        throw new Error("Lock on the source chain first (Full bridge).");
      }
      const musdWei = parseUnits(borrowMusd || "0", 18);
      if (musdWei <= 0n) throw new Error("Enter borrow amount");

      const liquidity = await marketMusdLiquidity();
      const usable =
        liquidity > BigInt(DESK_LIQUIDITY_RESERVE) * 10n ** 18n
          ? liquidity - BigInt(DESK_LIQUIDITY_RESERVE) * 10n ** 18n
          : 0n;
      if (musdWei > usable) {
        const avail = Number(formatUnits(usable, 18)).toFixed(2);
        throw new Error(
          `Usable desk liquidity is ${avail} MUSD. Borrow ≤ ${avail}, or refill.`,
        );
      }

      await ensureChain(mezoTestnet.id);
      await sendAndWait(
        `Claim Sepolia/Base lock → borrow ${borrowMusd} MUSD (1 Mezo confirm)`,
        () =>
          writeContractAsync({
            address: PEGORGE_PORTAL_ADDRESS,
            abi: portalAbi,
            functionName: "claimExpressLoan",
            args: [
              assetIdBytes(asset.id),
              lockProof.sourceToken,
              lockProof.amount,
              musdWei,
              BigInt(lockProof.sourceChainId),
              lockProof.sourceBlock,
              lockProof.sourceTime,
              lockProof.lockId,
            ],
            chainId: mezoTestnet.id,
          }),
        {
          kind: "borrow",
          title: `Borrow ${borrowMusd} MUSD`,
          detail: `Claimed lock ${lockProof.lockId.slice(0, 10)}…`,
          chainId: mezoTestnet.id,
          assetId: asset.id,
          amount: borrowMusd,
        },
      );
      pushActivity({
        kind: "wrap",
        title: `Claim wrap ${asset.ticker}`,
        detail: "Full bridge · lockId verified",
        chainId: mezoTestnet.id,
        assetId: asset.id,
      });
      setStep("done");
      push("Full bridge done - source lock claimed on Mezo.");
    },
    [
      asset.id,
      asset.ticker,
      ensureChain,
      lockProof,
      push,
      sendAndWait,
      writeContractAsync,
    ],
  );

  const runMezoApprove = useCallback(async () => {
    setError(null);
    const token = route.mezoToken;
    if (!token || !MARKET) {
      throw new Error(
        "Mezo token / market missing. Set NEXT_PUBLIC_MEZO_TOKEN_* and NEXT_PUBLIC_RWA_MARKET.",
      );
    }
    await ensureChain(mezoTestnet.id);
    const allowance = (await readContract(wagmiConfig, {
      address: token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address!, MARKET],
      chainId: mezoTestnet.id,
    })) as bigint;
    if (allowance >= amountWei) {
      push("Market already approved - skipped.");
      setStep("deposit");
      return;
    }
    await sendAndWait(
      "Approve RwaMUSDMarket",
      () =>
        writeContractAsync({
          address: token,
          abi: erc20Abi,
          functionName: "approve",
          args: [MARKET, maxUint256],
          chainId: mezoTestnet.id,
        }),
      {
        kind: "approve",
        title: `Approve market (${asset.ticker})`,
        chainId: mezoTestnet.id,
        assetId: asset.id,
      },
    );
    setStep("deposit");
  }, [
    address,
    amountWei,
    asset.id,
    asset.ticker,
    ensureChain,
    push,
    route.mezoToken,
    sendAndWait,
    writeContractAsync,
  ]);

  const runDeposit = useCallback(async () => {
    setError(null);
    const token = route.mezoToken;
    if (!token || !MARKET) throw new Error("Market not configured");
    await ensureChain(mezoTestnet.id);
    await sendAndWait(
      "Deposit collateral",
      () =>
        writeContractAsync({
          address: MARKET,
          abi: rwaMarketAbi,
          functionName: "deposit",
          args: [token, amountWei],
          chainId: mezoTestnet.id,
        }),
      {
        kind: "deposit",
        title: `Deposit ${asset.ticker}`,
        chainId: mezoTestnet.id,
        assetId: asset.id,
      },
    );
    setStep("borrow");
  }, [
    amountWei,
    asset.id,
    asset.ticker,
    ensureChain,
    route.mezoToken,
    sendAndWait,
    writeContractAsync,
  ]);

  const runBorrow = useCallback(
    async (borrowMusd: string) => {
      setError(null);
      const token = route.mezoToken;
      if (!token || !MARKET) throw new Error("Market not configured");
      const musdWei = parseUnits(borrowMusd || "0", 18);
      if (musdWei <= 0n) throw new Error("Enter borrow amount");
      const liquidity = await marketMusdLiquidity();
      const usable =
        liquidity > BigInt(DESK_LIQUIDITY_RESERVE) * 10n ** 18n
          ? liquidity - BigInt(DESK_LIQUIDITY_RESERVE) * 10n ** 18n
          : 0n;
      if (musdWei > usable) {
        const avail = Number(formatUnits(usable, 18)).toFixed(2);
        throw new Error(
          `Usable desk liquidity is ${avail} MUSD (keeps ${DESK_LIQUIDITY_RESERVE} in reserve). Borrow ≤ ${avail}, or refill the market.`,
        );
      }
      await ensureChain(mezoTestnet.id);
      await sendAndWait(
        `Borrow ${borrowMusd} MUSD`,
        () =>
          writeContractAsync({
            address: MARKET,
            abi: rwaMarketAbi,
            functionName: "borrow",
            args: [token, musdWei],
            chainId: mezoTestnet.id,
          }),
        {
          kind: "borrow",
          title: `Borrow ${borrowMusd} MUSD`,
          detail: `Against ${asset.ticker}`,
          chainId: mezoTestnet.id,
          assetId: asset.id,
          amount: borrowMusd,
        },
      );
      setStep("done");
      push("Done - MUSD borrowed.");
    },
    [
      asset.id,
      asset.ticker,
      ensureChain,
      push,
      route.mezoToken,
      sendAndWait,
      writeContractAsync,
    ],
  );

  const runNext = useCallback(
    async (borrowMusd?: string) => {
      try {
        reset();
        if (!isConnected) {
          setStep("connect");
          setError("Connect wallet from the navbar.");
          return;
        }

        // Default: one click runs the whole Mezo express loan
        if (mode === "express") {
          if (step === "done") return;
          // Single-tx Express — retry the whole expressLoan
          await runExpress(borrowMusd || "0");
          return;
        }

        setBusy(true);
        const current = step === "connect" ? "source_mint" : step;
        if (step === "connect") setStep("source_mint");
        if (current === "source_mint") await runSourceMint();
        else if (current === "source_approve") await runSourceApprove();
        else if (current === "source_lock") await runSourceLock();
        else if (current === "mezo_wrap")
          await runMezoWrap(borrowMusd || "0");
        else if (current === "mezo_approve") await runMezoApprove();
        else if (current === "deposit") await runDeposit();
        else if (current === "borrow") await runBorrow(borrowMusd || "0");
      } catch (e) {
        const msg = friendlyError(e);
        setError(msg);
        push(`Error: ${msg}`);
      } finally {
        setBusy(false);
      }
    },
    [
      isConnected,
      mode,
      push,
      reset,
      runBorrow,
      runDeposit,
      runExpress,
      runMezoApprove,
      runMezoWrap,
      runSourceApprove,
      runSourceLock,
      runSourceMint,
      step,
    ],
  );

  return {
    step,
    setStep,
    stepLabel: bridgeStepLabels[step],
    mode,
    setMode,
    progress,
    route,
    log,
    error,
    setError,
    lockProof,
    contractsReady: Boolean(PEGORGE_PORTAL_ADDRESS),
    marketReady: Boolean(MARKET && route.mezoToken),
    isPending: isPending || busy,
    confirmed: step === "done",
    txHash,
    runNext,
    chainId,
    isConnected,
    amountWei,
  };
}
