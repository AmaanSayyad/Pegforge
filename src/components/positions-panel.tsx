"use client";

import { ChevronDown, LayoutDashboard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { parseUnits } from "viem";
import { pushActivity } from "@/lib/activity";
import { mezoTestnet } from "@/lib/chains";
import {
  erc20Abi,
  MUSD_ADDRESS,
  rwaMarketAbi,
  RWA_MARKET_ADDRESS,
} from "@/lib/contracts";
import { cn, formatPct, formatUsd } from "@/lib/utils";
import { usePositions, type LivePosition } from "@/hooks/use-positions";
import { pageArt, pageArtFocus } from "@/lib/mezo-media";
import { WalletImportStrip } from "./add-musd-button";
import { TokenIcon } from "./token-icon";
import {
  EmptyState,
  FadeIn,
  HealthPill,
  LtvBar,
  PageHeader,
  SegmentedControl,
  StatTile,
  Surface,
} from "./ui";

const MARKET = RWA_MARKET_ADDRESS[mezoTestnet.id];
const MUSD = MUSD_ADDRESS[mezoTestnet.id];
const PAGE = 5;

export function PositionsPanel() {
  const { isConnected } = useAccount();
  const { positions, totals, isLoading, refetch, marketReady } = usePositions();
  const [openId, setOpenId] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => {
    if (positions.length === 0) {
      setOpenId(null);
      return;
    }
    setOpenId((cur) =>
      cur && positions.some((p) => p.asset.id === cur)
        ? cur
        : positions[0]?.asset.id ?? null,
    );
    setVisible(PAGE);
  }, [positions]);

  const shown = useMemo(
    () => positions.slice(0, visible),
    [positions, visible],
  );
  const hasMore = visible < positions.length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Loans"
        title="RWA positions"
        description="Live collateral and MUSD debt. Tap a row to repay or withdraw."
        banner={pageArt.positions}
        bannerFocus={pageArtFocus.positions}
        action={
          <Link href="/forge" className="btn-primary !py-2.5 text-[13px]">
            Add collateral
          </Link>
        }
      />

      {!marketReady ? (
        <EmptyState
          icon={<LayoutDashboard className="h-6 w-6" />}
          title="Market not configured"
          body="Set NEXT_PUBLIC_RWA_MARKET in .env after deploy."
        />
      ) : !isConnected ? (
        <EmptyState
          icon={<LayoutDashboard className="h-6 w-6" />}
          title="Connect wallet"
          body="Connect to Mezo testnet to load your RWA → MUSD positions."
        />
      ) : (
        <>
          <FadeIn className="sticky top-14 z-20 grid gap-3 sm:top-[4.25rem] sm:grid-cols-3">
            <StatTile label="Positions" value={String(totals.count)} />
            <StatTile
              label="Collateral"
              value={formatUsd(totals.collateralUsd)}
              tone="pink"
            />
            <StatTile
              label="MUSD debt"
              value={`${totals.debtMusd.toFixed(2)}`}
              hint={
                totals.collateralUsd > 0
                  ? `Book LTV ${formatPct(totals.healthLtv)}`
                  : undefined
              }
            />
          </FadeIn>

          {isLoading && positions.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-[#666]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading positions…
            </div>
          ) : null}

          {positions.length === 0 && !isLoading ? (
            <EmptyState
              icon={<LayoutDashboard className="h-6 w-6" />}
              title="No open positions"
              body="Bridge RWA collateral on the Desk, deposit into the market, then borrow MUSD."
              action={
                <Link href="/forge" className="btn-primary">
                  Open Desk
                </Link>
              }
            />
          ) : (
            <Surface pad="none" className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-[#f0f0ee] px-4 py-3 md:px-5">
                <p className="text-[13px] text-[#888]">
                  Showing{" "}
                  <span className="font-semibold text-[#111]">
                    {shown.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#111]">
                    {positions.length}
                  </span>
                </p>
                <p className="text-[12px] text-[#bbb]">
                  Scroll · tap a loan to manage
                </p>
              </div>

              <ul className="max-h-[min(70vh,52rem)] divide-y divide-[#f3f3f1] overflow-y-auto overscroll-contain">
                {shown.map((p, i) => (
                  <li key={p.asset.id}>
                    <PositionRow
                      position={p}
                      index={i}
                      open={openId === p.asset.id}
                      onToggle={() =>
                        setOpenId((id) =>
                          id === p.asset.id ? null : p.asset.id,
                        )
                      }
                      onDone={refetch}
                    />
                  </li>
                ))}
              </ul>

              {hasMore ? (
                <div className="border-t border-[#f0f0ee] p-3 text-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#111] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#e6005c]"
                  >
                    Load {Math.min(PAGE, positions.length - visible)} more
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : positions.length > PAGE ? (
                <p className="border-t border-[#f0f0ee] px-4 py-2.5 text-center text-[12px] text-[#bbb]">
                  End of list · {positions.length} positions
                </p>
              ) : null}
            </Surface>
          )}
        </>
      )}
    </div>
  );
}

function PositionRow({
  position,
  index,
  open,
  onToggle,
  onDone,
}: {
  position: LivePosition;
  index: number;
  open: boolean;
  onToggle: () => void;
  onDone: () => void;
}) {
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: mezoTestnet.id });
  const { writeContractAsync, isPending, reset } = useWriteContract();
  const [mode, setMode] = useState<"repay" | "withdraw">("repay");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const busy = isPending || confirming;

  async function submit() {
    setError(null);
    if (!address || !MARKET || !position.token || !publicClient) return;
    try {
      reset();
      setConfirming(true);
      await switchChainAsync({ chainId: mezoTestnet.id });
      const wei = parseUnits(amount || "0", 18);
      if (wei <= 0n) throw new Error("Enter an amount");

      if (mode === "repay") {
        const approveHash = await writeContractAsync({
          address: MUSD,
          abi: erc20Abi,
          functionName: "approve",
          args: [MARKET, wei],
          chainId: mezoTestnet.id,
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        const tx = await writeContractAsync({
          address: MARKET,
          abi: rwaMarketAbi,
          functionName: "repay",
          args: [position.token, wei],
          chainId: mezoTestnet.id,
        });
        await publicClient.waitForTransactionReceipt({ hash: tx });
        pushActivity({
          kind: "repay",
          title: `Repay ${amount} MUSD`,
          detail: `Against ${position.asset.ticker}`,
          hash: tx,
          chainId: mezoTestnet.id,
          assetId: position.asset.id,
          amount,
        });
      } else {
        const tx = await writeContractAsync({
          address: MARKET,
          abi: rwaMarketAbi,
          functionName: "withdraw",
          args: [position.token, wei],
          chainId: mezoTestnet.id,
        });
        await publicClient.waitForTransactionReceipt({ hash: tx });
        pushActivity({
          kind: "withdraw",
          title: `Withdraw ${amount} ${position.asset.ticker}`,
          detail: "RWA collateral from market",
          hash: tx,
          chainId: mezoTestnet.id,
          assetId: position.asset.id,
          amount,
        });
      }
      setAmount("");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setConfirming(false);
    }
  }

  function fillMax() {
    if (mode === "repay") setAmount(String(position.debtMusd));
    else setAmount(String(position.collateralUnits));
  }

  return (
    <FadeIn delay={Math.min(index * 0.02, 0.16)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3.5 text-left transition md:px-5",
          open ? "bg-[#fdeef1]/35" : "hover:bg-[#fafaf8]",
        )}
      >
        <TokenIcon
          src={position.asset.logo}
          alt={position.asset.ticker}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold tracking-[-0.02em] text-[#111]">
              {position.asset.name}
            </span>
            <span className="rounded-full bg-[#f7f7f5] px-2 py-0.5 text-[10px] font-semibold text-[#e6005c]">
              {position.asset.ticker}
            </span>
            <HealthPill
              ltv={position.ltvPercent}
              max={position.asset.maxLtvPercent}
              liq={position.asset.liqLtvPercent}
            />
          </div>
          <p className="mt-0.5 text-[12px] text-[#888]">
            {position.collateralUnits.toFixed(4)} {position.asset.unit} ·{" "}
            {formatUsd(position.collateralUsd)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-semibold tabular-nums tracking-[-0.02em] text-[#111]">
            {position.debtMusd.toFixed(2)}{" "}
            <span className="text-[11px] font-medium text-[#888]">MUSD</span>
          </p>
          <p className="text-[11px] text-[#bbb]">
            {formatPct(position.ltvPercent)} LTV
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#bbb] transition",
            open && "rotate-180 text-[#e6005c]",
          )}
        />
      </button>

      {open ? (
        <div
          className="space-y-4 border-t border-[#f0f0ee] bg-white px-4 py-4 md:px-5"
          onClick={(e) => e.stopPropagation()}
        >
          <LtvBar
            ltv={position.ltvPercent}
            max={position.asset.maxLtvPercent}
            liq={position.asset.liqLtvPercent}
          />
          <p className="text-[12px] text-[#888]">
            Borrow capacity left · {position.maxBorrowMusd.toFixed(2)} MUSD
          </p>

          <WalletImportStrip
            note={`MetaMask shows 0 ${position.asset.ticker} because these shares are locked as collateral. Import to list the token; MUSD should show a real balance.`}
            collateral={
              position.token
                ? {
                    address: position.token,
                    symbol: position.asset.ticker,
                    image:
                      typeof window !== "undefined"
                        ? `${window.location.origin}${position.asset.logo}`
                        : undefined,
                  }
                : undefined
            }
          />

          <SegmentedControl
            value={mode}
            onChange={setMode}
            layoutId={`pos-mode-${position.asset.id}`}
            options={[
              { id: "repay", label: "Repay" },
              { id: "withdraw", label: "Withdraw" },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="min-w-0 text-sm">
              <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.12em] text-[#999]">
                {mode === "repay"
                  ? "MUSD amount"
                  : `${position.asset.ticker} amount`}
              </span>
              <div className="flex gap-2">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="input-mezo min-w-0 !text-[18px]"
                />
                <button
                  type="button"
                  onClick={fillMax}
                  className="btn-ghost shrink-0"
                >
                  Max
                </button>
              </div>
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="btn-primary w-full justify-center sm:min-w-[148px] sm:w-auto"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "repay" ? (
                "Repay MUSD"
              ) : (
                "Withdraw"
              )}
            </button>
          </div>
          {error ? (
            <p className="rounded-2xl bg-[#fff4e5] px-3 py-2 text-[13px] text-[#9a5b00]">
              {error}
            </p>
          ) : (
            <p className="text-[12px] leading-relaxed text-[#888]">
              {mode === "repay"
                ? "Approves MUSD, then repays debt. Clear debt before pulling all collateral."
                : "Withdraw only while remaining LTV stays under max. Repay first if the bar is high."}
            </p>
          )}
        </div>
      ) : null}
    </FadeIn>
  );
}
