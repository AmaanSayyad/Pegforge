"use client";

import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { isAddress, parseEther, parseUnits, type Address, type Hex } from "viem";
import { pushActivity } from "@/lib/activity";
import { mezoTestnet } from "@/lib/chains";
import { erc20Abi } from "@/lib/contracts";
import { MEZO_MUSD_BTC_POOL, sendableMezoTokens } from "@/lib/tokens";
import { shortAddress } from "@/lib/utils";
import { mezo, pageArt, pageArtFocus } from "@/lib/mezo-media";
import { FadeIn, PageHeader, SoftLink, Surface } from "./ui";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Tab = "deposit" | "withdraw" | "send" | "receive";

export function TransactPanel() {
  const [tab, setTab] = useState<Tab>("send");
  const tabs: { id: Tab; label: string; blurb: string }[] = [
    { id: "deposit", label: "Deposit", blurb: "Bring assets onto Mezo" },
    { id: "withdraw", label: "Withdraw", blurb: "Exit loans & vaults" },
    { id: "send", label: "Send", blurb: "Transfer on Mezo" },
    { id: "receive", label: "Receive", blurb: "Your address" },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        eyebrow="Move funds"
        title="Transact"
        description="Same mental model as Mezo: deposit in, withdraw out, send peers, receive."
        banner={pageArt.transact}
        bannerFocus={pageArtFocus.transact}
      />

      <FadeIn>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-[1.15rem] border px-3 py-3 text-left transition",
                  active
                    ? "border-[#e6005c] bg-[#fdeef1] shadow-[0_10px_28px_-20px_rgba(230,0,92,0.7)]"
                    : "border-[#ebebe8] bg-white hover:border-[#e6005c]/35",
                )}
              >
                <p
                  className={cn(
                    "text-[14px] font-semibold",
                    active ? "text-[#e6005c]" : "text-[#111]",
                  )}
                >
                  {t.label}
                </p>
                <p className="mt-0.5 text-[11px] text-[#888]">{t.blurb}</p>
              </button>
            );
          })}
        </div>
      </FadeIn>

      <FadeIn delay={0.05} key={tab}>
        {tab === "deposit" ? <DepositTab /> : null}
        {tab === "withdraw" ? <WithdrawTab /> : null}
        {tab === "send" ? <SendTab /> : null}
        {tab === "receive" ? <ReceiveTab /> : null}
      </FadeIn>
    </div>
  );
}

function DepositTab() {
  return (
    <Surface>
      <h2 className="text-[18px] font-semibold tracking-[-0.03em]">
        Deposit onto Mezo
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[#666]">
        Gas BTC from the faucet. RWA collateral deposits happen on the Desk.
        Yield vaults stay on Mezo.
      </p>
      <div className="mt-5 space-y-2">
        <SoftLink href={MEZO_MUSD_BTC_POOL.faucetUrl} external>
          Claim testnet BTC (faucet)
          <ExternalLink className="h-3.5 w-3.5 opacity-50" />
        </SoftLink>
        <SoftLink
          href={`${MEZO_MUSD_BTC_POOL.transactUrl}?tab=deposit`}
          external
        >
          Mezo Transact · Deposit BTC / tBTC
          <ExternalLink className="h-3.5 w-3.5 opacity-50" />
        </SoftLink>
        <SoftLink href="/forge">
          Pegforge Desk · Deposit RWA collateral
          <span className="text-[#bbb]">→</span>
        </SoftLink>
        <SoftLink href={MEZO_MUSD_BTC_POOL.vaultsUrl} external>
          Mezo Vaults · Deposit MUSD for yield
          <ExternalLink className="h-3.5 w-3.5 opacity-50" />
        </SoftLink>
      </div>
    </Surface>
  );
}

function WithdrawTab() {
  return (
    <Surface>
      <h2 className="text-[18px] font-semibold tracking-[-0.03em]">Withdraw</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[#666]">
        Pull RWA out of a Pegforge loan after repay, or exit Mezo vaults via
        their Transact flow.
      </p>
      <div className="mt-5 space-y-2">
        <SoftLink href="/positions">
          Pegforge Positions · Withdraw RWA / repay
          <span className="text-[#bbb]">→</span>
        </SoftLink>
        <SoftLink
          href={`${MEZO_MUSD_BTC_POOL.transactUrl}?tab=withdraw`}
          external
        >
          Mezo Transact · Withdraw BTC / MUSD
          <ExternalLink className="h-3.5 w-3.5 opacity-50" />
        </SoftLink>
        <SoftLink href={MEZO_MUSD_BTC_POOL.vaultsUrl} external>
          Mezo Vaults · Withdraw deposits
          <ExternalLink className="h-3.5 w-3.5 opacity-50" />
        </SoftLink>
      </div>
    </Surface>
  );
}

function SendTab() {
  const { address, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const tokens = useMemo(() => sendableMezoTokens(), []);
  const [tokenId, setTokenId] = useState(tokens[1]?.id || "musd");
  const token = tokens.find((t) => t.id === tokenId) || tokens[0];
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: nativeBal } = useBalance({
    address,
    chainId: mezoTestnet.id,
    query: { enabled: Boolean(address) && token?.kind === "native" },
  });

  const { writeContractAsync, isPending: ercPending } = useWriteContract();
  const {
    sendTransactionAsync,
    isPending: nativePending,
    data: nativeHash,
  } = useSendTransaction();
  const [lastHash, setLastHash] = useState<Hex | undefined>();
  const hash = lastHash || nativeHash;
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash });
  const busy = ercPending || nativePending || confirming;

  async function submit() {
    setError(null);
    if (!isConnected || !address || !token) {
      setError("Connect wallet first");
      return;
    }
    if (!isAddress(to)) {
      setError("Enter a valid 0x recipient");
      return;
    }
    try {
      await switchChainAsync({ chainId: mezoTestnet.id });
      let tx: Hex;
      if (token.kind === "native") {
        tx = await sendTransactionAsync({
          to: to as Address,
          value: parseEther(amount || "0"),
          chainId: mezoTestnet.id,
        });
      } else {
        if (!token.address) throw new Error("Token address missing");
        tx = await writeContractAsync({
          address: token.address,
          abi: erc20Abi,
          functionName: "transfer",
          args: [to as Address, parseUnits(amount || "0", 18)],
          chainId: mezoTestnet.id,
        });
      }
      setLastHash(tx);
      pushActivity({
        kind: "send",
        title: `Send ${amount} ${token.symbol}`,
        detail: `To ${shortAddress(to)}`,
        hash: tx,
        chainId: mezoTestnet.id,
        amount,
      });
      setAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    }
  }

  return (
    <Surface>
      <h2 className="text-[18px] font-semibold tracking-[-0.03em]">
        Send on Mezo
      </h2>
      <p className="mt-1 text-[14px] text-[#666]">
        Transfer BTC gas, MUSD, or wrapped RWA on chain 31611.
      </p>

      <label className="mt-5 block text-sm">
        <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.12em] text-[#999]">
          Asset
        </span>
        <select
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="w-full rounded-[1rem] border border-[#e8e8e8] bg-[#f7f7f5] px-3 py-3 text-[15px] font-medium outline-none focus:border-[#e6005c]"
        >
          {tokens.map((t) => (
            <option
              key={t.id}
              value={t.id}
              disabled={t.kind !== "native" && !t.address}
            >
              {t.symbol} - {t.name}
            </option>
          ))}
        </select>
      </label>

      {token?.kind === "native" && nativeBal ? (
        <p className="mt-2 text-[12px] text-[#888]">
          Available {Number(nativeBal.formatted).toFixed(6)} BTC
        </p>
      ) : null}

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.12em] text-[#999]">
          Amount
        </span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="input-mezo"
        />
      </label>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.12em] text-[#999]">
          Recipient (0x)
        </span>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="0x…"
          className="input-mezo !font-mono !text-[14px] !font-medium"
        />
      </label>

      <button
        type="button"
        disabled={busy || !isConnected}
        onClick={() => void submit()}
        className="btn-primary mt-5 w-full justify-center"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send on Mezo"}
      </button>
      {error ? (
        <p className="mt-3 rounded-2xl bg-[#fff4e5] px-3 py-2 text-[13px] text-[#9a5b00]">
          {error}
        </p>
      ) : null}
    </Surface>
  );
}

function ReceiveTab() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    pushActivity({
      kind: "receive",
      title: "Copied Mezo receive address",
      detail: shortAddress(address),
      chainId: mezoTestnet.id,
    });
  }

  if (!isConnected || !address) {
    return (
      <Surface>
        <h2 className="text-[18px] font-semibold">Receive</h2>
        <p className="mt-2 text-[14px] text-[#666]">
          Connect a wallet to show your Mezo address.
        </p>
      </Surface>
    );
  }

  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(address)}`;

  return (
    <Surface className="relative overflow-hidden text-center">
      <div className="pointer-events-none absolute -right-6 top-0 h-28 w-28 opacity-40">
        <Image src={mezo.handMobile} alt="" fill className="object-contain" />
      </div>
      <h2 className="relative text-[18px] font-semibold tracking-[-0.03em]">
        Your Mezo address
      </h2>
      <p className="relative mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-[#666]">
        Same EVM address receives BTC gas, MUSD, and Pegforge wrapped RWAs on
        Mezo testnet.
      </p>
      <div className="relative mt-6 flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qr}
          alt="Receive QR"
          width={180}
          height={180}
          className="rounded-[1.25rem] bg-white p-3 shadow-[0_12px_32px_-20px_rgba(17,17,17,0.35)] ring-1 ring-[#ebebe8]"
        />
      </div>
      <p className="mt-5 break-all font-mono text-[12px] text-[#333]">{address}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => void copy()}
          className="btn-primary flex-1 justify-center gap-2"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy address"}
        </button>
        <a
          href={`https://explorer.test.mezo.org/address/${address}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary flex-1 justify-center gap-2"
        >
          <ExternalLink className="h-4 w-4" /> Explorer
        </a>
      </div>
      <p className="mt-4 text-[12px] text-[#999]">
        Or open{" "}
        <Link href="/positions" className="font-medium text-[#e6005c] underline">
          Positions
        </Link>{" "}
        after someone sends you RWA / MUSD.
      </p>
    </Surface>
  );
}
