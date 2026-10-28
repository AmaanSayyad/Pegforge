"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  cappedMaxBorrow,
  categoryLabels,
  collateralAssets,
  defaultBorrowFor,
  defaultUnitsFor,
  DEMO_DEFAULT_BORROW_MUSD,
  DESK_LIQUIDITY_RESERVE,
  PRICE_AS_OF,
  simulateBorrow,
  usableDeskLiquidity,
  type AssetCategory,
  type CollateralAsset,
} from "@/lib/assets";
import { bridgeStepLabels, type BridgeStep } from "@/lib/bridge";
import { mezoTestnet } from "@/lib/chains";
import {
  erc20Abi,
  MUSD_ADDRESS,
  RWA_MARKET_ADDRESS,
} from "@/lib/contracts";
import { mezo } from "@/lib/mezo-media";
import { cn, formatPct, formatPrice, formatUsd } from "@/lib/utils";
import { useBridgeFlow } from "@/hooks/use-bridge-flow";
import { AddMusdButton, AddTokenButton } from "./add-musd-button";
import { TokenIcon, TokenPair } from "./token-icon";
import { LtvBar, SegmentedControl, Surface } from "./ui";

const MARKET = RWA_MARKET_ADDRESS[mezoTestnet.id];
const MUSD = MUSD_ADDRESS[mezoTestnet.id];

const categoryArt: Record<AssetCategory, string> = {
  equities: mezo.earnVault,
  metals: mezo.percentCrop,
  energy: mezo.earnPools,
};

const tabs: { id: AssetCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "equities", label: "Stocks" },
  { id: "metals", label: "Metals" },
  { id: "energy", label: "Energy" },
];

const FULL_STEPS: BridgeStep[] = [
  "source_mint",
  "source_approve",
  "source_lock",
  "mezo_wrap",
  "done",
];

const EXPRESS_STEPS: BridgeStep[] = ["borrow", "done"];

export function ForgePanel() {
  const [tab, setTab] = useState<AssetCategory | "all">("all");
  const [asset, setAsset] = useState<CollateralAsset>(collateralAssets[0]);
  const initialUnits = defaultUnitsFor(collateralAssets[0]);
  const [units, setUnits] = useState(String(initialUnits));
  const [borrow, setBorrow] = useState(
    String(defaultBorrowFor(collateralAssets[0], initialUnits)),
  );

  const { address, isConnected } = useAccount();
  const bridge = useBridgeFlow(asset, units);
  const { writeContractAsync, data: refillHash, isPending: refillPending } =
    useWriteContract();
  const { isLoading: refillConfirming, isSuccess: refillOk } =
    useWaitForTransactionReceipt({ hash: refillHash });

  const { data: marketMusd, refetch: refetchLiquidity } = useReadContract({
    address: MUSD,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: MARKET ? [MARKET] : undefined,
    chainId: mezoTestnet.id,
    query: { enabled: Boolean(MARKET), refetchInterval: 12_000 },
  });

  const { data: walletMusd } = useReadContract({
    address: MUSD,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: mezoTestnet.id,
    query: { enabled: Boolean(address) },
  });

  const deskLiquidity =
    marketMusd !== undefined ? Number(formatUnits(marketMusd, 18)) : undefined;
  const walletLiquidity =
    walletMusd !== undefined ? Number(formatUnits(walletMusd, 18)) : undefined;
  const usableLiquidity = usableDeskLiquidity(deskLiquidity);

  useEffect(() => {
    if (refillOk) void refetchLiquidity();
  }, [refillOk, refetchLiquidity]);

  // Once desk liquidity is known, clamp oversized defaults (e.g. stale 1422) down
  useEffect(() => {
    if (deskLiquidity === undefined) return;
    const u = Number(units) || 0;
    const want = Number(borrow) || 0;
    const maxOk = cappedMaxBorrow(asset, u, deskLiquidity);
    if (want > maxOk) {
      setBorrow(String(defaultBorrowFor(asset, u, deskLiquidity)));
    }
  }, [deskLiquidity, asset, units]); // eslint-disable-line react-hooks/exhaustive-deps -- only reclamp when liquidity/asset/units change

  const visible = useMemo(
    () =>
      tab === "all"
        ? collateralAssets
        : collateralAssets.filter((a) => a.category === tab),
    [tab],
  );

  const plan = useMemo(() => {
    const base = simulateBorrow({
      units: Number(units) || 0,
      priceUsd: asset.priceUsd,
      maxLtvPercent: asset.maxLtvPercent,
      liqLtvPercent: asset.liqLtvPercent,
      borrowMusd: Number(borrow) || 0,
    });
    if (base.ok && Number(borrow) > usableLiquidity + 1e-9) {
      return {
        ...base,
        ok: false as const,
        reason: `Usable desk liquidity is ${usableLiquidity.toFixed(0)} MUSD (keeps ${DESK_LIQUIDITY_RESERVE} in reserve). Lower borrow or refill the market.`,
      };
    }
    return base;
  }, [units, borrow, asset, usableLiquidity]);

  function selectAsset(a: CollateralAsset) {
    setAsset(a);
    const u = defaultUnitsFor(a);
    setUnits(String(u));
    setBorrow(String(defaultBorrowFor(a, u, deskLiquidity)));
    bridge.setStep("connect");
  }

  function fillMaxBorrow() {
    setBorrow(
      String(cappedMaxBorrow(asset, Number(units) || 0, deskLiquidity)),
    );
  }

  async function refillDesk() {
    if (!MARKET || !address) return;
    const seed = Math.min(walletLiquidity ?? 0, 500);
    if (seed < 1) return;
    await writeContractAsync({
      address: MUSD,
      abi: erc20Abi,
      functionName: "transfer",
      args: [MARKET, parseUnits(String(Math.floor(seed)), 18)],
      chainId: mezoTestnet.id,
    });
    void refetchLiquidity();
  }

  const steps = bridge.mode === "express" ? EXPRESS_STEPS : FULL_STEPS;
  const stepIndex = Math.max(
    0,
    steps.indexOf(
      bridge.step === "connect"
        ? bridge.mode === "express"
          ? "borrow"
          : "source_mint"
        : bridge.step,
    ),
  );

  return (
    <div className="split-desk">
      <div className="min-w-0">
        <div className="relative mb-6 h-44 overflow-hidden rounded-[1.5rem] bg-[#111] shadow-[0_20px_50px_-36px_rgba(17,17,17,0.55)] md:h-52">
          <Image
            src={categoryArt[asset.category]}
            alt=""
            fill
            className="object-cover object-[center_30%]"
            sizes="(max-width: 1024px) 100vw, 58vw"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/15" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:gap-4 sm:p-5 md:p-6">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/75">
                Desk · Mezo testnet
              </p>
              <h2 className="mt-1 max-w-[16ch] text-[22px] font-bold tracking-[-0.04em] text-white sm:text-[26px] md:text-[32px]">
                Post {asset.name}. Take MUSD.
              </h2>
            </div>
            <div className="shrink-0 pb-0.5">
              <TokenPair
                collateralSrc={asset.logo}
                collateralAlt={asset.name}
                size={52}
              />
            </div>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-[#ebebe8] bg-white p-4 md:p-5">
          <p className="text-[14px] leading-relaxed text-[#444]">
            <span className="font-semibold text-[#111]">In plain words:</span>{" "}
            <strong>Express</strong> mints wrapped {asset.ticker} on Mezo and
            borrows in one confirm. <strong>Full bridge</strong> locks the{" "}
            {bridge.route.sourceChainName} mock via {bridge.route.protocolLabel}
            , then Mezo <code className="rounded bg-[#f7f7f5] px-1">claimExpressLoan</code>{" "}
            must match that vault lockId before it mints and borrows.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => {
                bridge.setMode("express");
                bridge.setStep("connect");
              }}
              className={cn(
                "rounded-full px-3.5 py-2 text-left text-[12px] font-semibold transition sm:py-1.5",
                bridge.mode === "express"
                  ? "bg-[#111] text-white"
                  : "bg-[#f3f3f3] text-[#666] hover:bg-[#ebebe8]",
              )}
            >
              <span className="sm:hidden">Express · 1 confirm</span>
              <span className="hidden sm:inline">Express · 1 MetaMask confirm</span>
            </button>
            <button
              type="button"
              onClick={() => {
                bridge.setMode("full");
                bridge.setStep("connect");
              }}
              className={cn(
                "rounded-full px-3.5 py-2 text-left text-[12px] font-semibold transition sm:py-1.5",
                bridge.mode === "full"
                  ? "bg-[#111] text-white"
                  : "bg-[#f3f3f3] text-[#666] hover:bg-[#ebebe8]",
              )}
            >
              <span className="sm:hidden">Full bridge · source → Mezo</span>
              <span className="hidden sm:inline">Full bridge · Sepolia then Mezo</span>
            </button>
          </div>
          <p className="mt-2 text-[12px] text-[#999]">
            Oracle as of {PRICE_AS_OF}. Full bridge uses a real source-chain
            lock; Mezo will not wrap without that lockId. (Production would
            attest the lock with Wormhole/LZ instead of preimage checks.)
          </p>
        </div>

        <div className="mt-6">
          <SegmentedControl
            value={tab}
            onChange={setTab}
            layoutId="forge-asset-tabs"
            options={tabs.map((t) => ({ id: t.id, label: t.label }))}
          />
        </div>

        <div className="scroll-soft mt-5 grid max-h-[380px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {visible.map((a) => {
            const active = a.id === asset.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => selectAsset(a)}
                className={cn(
                  "rounded-[1.15rem] border p-3.5 text-left transition",
                  active
                    ? "border-[#e6005c] bg-[#fdeef1] shadow-[0_8px_24px_-18px_rgba(230,0,92,0.55)]"
                    : "border-[#e8e8e8] bg-white hover:border-[#e6005c]/40",
                )}
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                  <TokenIcon src={a.logo} alt={a.name} size={40} />
                  <div className="min-w-0">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <p className="truncate text-[11px] font-medium uppercase tracking-wide text-[#999]">
                        {categoryLabels[a.category]}
                      </p>
                      <span className="font-mono text-[11px] text-[#e6005c]">
                        {a.ticker}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[16px] font-semibold tracking-[-0.03em] text-[#111]">
                      {a.name}
                    </p>
                    <p className="mt-1 text-[12px] text-[#666]">
                      {formatPrice(a.priceUsd)} / {a.unit} · {a.maxLtvPercent}%
                      LTV
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Surface className="mt-6 space-y-5">
          <Field label={`${asset.ticker} amount (${asset.unit})`}>
            <input
              className="input-mezo"
              value={units}
              onChange={(e) => {
                setUnits(e.target.value.replace(/[^0-9.]/g, ""));
                bridge.setStep("connect");
              }}
              inputMode="decimal"
            />
          </Field>
          <Field
            label="Borrow (MUSD)"
            action={
              <button
                type="button"
                onClick={fillMaxBorrow}
                className="text-[12px] font-medium text-[#e6005c] hover:underline"
              >
                Max
              </button>
            }
          >
            <input
              className="input-mezo"
              value={borrow}
              onChange={(e) =>
                setBorrow(e.target.value.replace(/[^0-9.]/g, ""))
              }
              inputMode="decimal"
            />
          </Field>
          <p className="text-[13px] leading-relaxed text-[#666]">{asset.blurb}</p>
          <p className="text-[12px] text-[#999]">{asset.realWorldHint}</p>
        </Surface>
      </div>

      <aside className="split-rail min-w-0">
        <Surface>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#999]">
            {bridge.mode === "express" ? "Express route" : "Full bridge"}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] font-medium text-[#111]">
            {bridge.mode === "full" ? (
              <>
                <span className="rounded-full bg-[#f3f3f3] px-3 py-1.5">
                  {bridge.route.sourceChainName}
                </span>
                <ArrowRight className="h-4 w-4 text-[#999]" />
              </>
            ) : null}
            <span className="rounded-full bg-[#fdeef1] px-3 py-1.5 text-[#e6005c]">
              Mezo Testnet
            </span>
          </div>
          <p className="mt-3 text-[13px] text-[#666]">
            {bridge.mode === "express"
              ? `One tx: wrap ${asset.ticker} into market + borrow MUSD`
              : `Lock on ${bridge.route.sourceChainName}, then 1 Mezo tx claims that lockId + borrows`}
          </p>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-[11px] text-[#999]">
              <span>Progress</span>
              <span>
                {bridge.progress.of > 0
                  ? `${bridge.progress.n} / ${bridge.progress.of}`
                  : `${Math.min(stepIndex + 1, steps.length - 1)} / ${steps.length - 1}`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0ee]">
              <motion.div
                className="h-full rounded-full bg-[#e6005c]"
                animate={{
                  width: `${
                    bridge.progress.of > 0
                      ? (bridge.progress.n / bridge.progress.of) * 100
                      : ((stepIndex + (bridge.step === "done" ? 1 : 0)) /
                          (steps.length - 1)) *
                        100
                  }%`,
                }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {steps
              .filter((s) => s !== "done" && !(bridge.mode === "express" && s === "mezo_approve"))
              .map((s, i) => (
                <span
                  key={s}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium",
                    i <= stepIndex
                      ? "bg-[#111] text-white"
                      : "bg-[#f3f3f3] text-[#999]",
                  )}
                >
                  {i + 1}.{" "}
                  {bridge.mode === "express" && s === "borrow"
                    ? "Express loan"
                    : s === "mezo_wrap"
                      ? "Claim + borrow"
                      : bridgeStepLabels[s]}
                </span>
              ))}
          </div>
        </Surface>

        <Surface>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#999]">
            Position
          </p>
          <div className="mt-4 flex items-center gap-3">
            <TokenPair
              collateralSrc={asset.logo}
              collateralAlt={asset.name}
              size={44}
            />
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#111]">
                {asset.ticker} → MUSD
              </p>
              <p className="text-[12px] text-[#999]">
                {categoryLabels[asset.category]} · {formatPrice(asset.priceUsd)}{" "}
                / {asset.unit}
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-2 text-[14px]">
            <Row label="Max LTV" value={`${asset.maxLtvPercent}%`} />
            <Row label="Liq LTV" value={`${asset.liqLtvPercent}%`} />
            <Row label="Step" value={bridge.stepLabel} />
          </div>
        </Surface>

        <Surface className="shadow-[0_18px_48px_-30px_rgba(17,17,17,0.4)]">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#999]">
            Borrow check
          </p>

          {!plan.ok ? (
            <div className="mt-4 flex gap-2 rounded-2xl bg-[#fff4e5] p-3 text-[13px] text-[#9a5b00]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {plan.reason}
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat label="Collateral" value={formatUsd(plan.collateralUsd)} />
                <Stat
                  label="Max borrow"
                  value={formatUsd(
                    Math.min(plan.maxBorrow, usableLiquidity),
                  )}
                />
                <Stat label="Your LTV" value={formatPct(plan.ltvPercent)} />
                <Stat
                  label="Desk liquidity"
                  value={
                    deskLiquidity !== undefined
                      ? `${deskLiquidity.toFixed(0)} MUSD`
                      : "-"
                  }
                />
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-[#888]">
                Default borrow is {DEMO_DEFAULT_BORROW_MUSD} MUSD so the shared
                desk lasts across assets. Max leaves {DESK_LIQUIDITY_RESERVE}{" "}
                MUSD in reserve
                {usableLiquidity < Infinity
                  ? ` · ${usableLiquidity.toFixed(0)} usable now`
                  : ""}
                .
              </p>
              <div className="mt-4">
                <LtvBar
                  ltv={plan.ltvPercent}
                  max={asset.maxLtvPercent}
                  liq={asset.liqLtvPercent}
                />
              </div>
            </>
          )}

          <button
            type="button"
            disabled={bridge.isPending || !plan.ok || bridge.step === "done"}
            onClick={() => void bridge.runNext(borrow)}
            className="btn-primary mt-6 w-full !px-4 text-[13px] sm:text-[15px]"
          >
            {bridge.isPending ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span className="truncate">
                  {bridge.progress.label
                    ? `${bridge.progress.n}/${bridge.progress.of} · ${bridge.progress.label}`
                    : "Confirm in wallet…"}
                </span>
              </>
            ) : bridge.step === "done" ? (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Borrowed MUSD
              </>
            ) : bridge.step === "borrow" ? (
              <>
                <TokenIcon src="/tokens/musd.png" alt="" size={20} />
                <span className="truncate">Retry borrow {borrow} MUSD</span>
              </>
            ) : (
              <>
                <TokenIcon src={asset.logo} alt="" size={20} />
                <span className="truncate text-left">
                  {bridge.mode === "express"
                    ? `Borrow MUSD · 1 confirm`
                    : bridge.step === "connect" || bridge.step === "source_mint"
                      ? `Start full bridge`
                      : bridge.stepLabel}
                </span>
              </>
            )}
          </button>

          {deskLiquidity !== undefined &&
          usableLiquidity < DEMO_DEFAULT_BORROW_MUSD ? (
            <div className="mt-3 rounded-2xl bg-[#fff4e5] p-3 text-[12px] leading-relaxed text-[#9a5b00]">
              Desk liquidity is low ({deskLiquidity.toFixed(2)} MUSD ·{" "}
              {usableLiquidity.toFixed(0)} usable). Refill the market or borrow
              a smaller amount so other assets still have MUSD.
              {isConnected && (walletLiquidity ?? 0) >= 1 ? (
                <button
                  type="button"
                  disabled={refillPending || refillConfirming}
                  onClick={() => void refillDesk()}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#111] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#333] disabled:opacity-50"
                >
                  {refillPending || refillConfirming ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : refillOk ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : null}
                  {refillOk
                    ? "Refilled - try borrow"
                    : `Send ${Math.min(Math.floor(walletLiquidity ?? 0), 500)} MUSD to desk`}
                </button>
              ) : null}
            </div>
          ) : null}

          {!bridge.contractsReady ? (
            <p className="mt-3 text-[12px] leading-relaxed text-[#9a5b00]">
              Set{" "}
              <code className="rounded bg-[#fff4e5] px-1">
                NEXT_PUBLIC_PEGORGE_PORTAL
              </code>{" "}
              and{" "}
              <code className="rounded bg-[#fff4e5] px-1">
                NEXT_PUBLIC_RWA_MARKET
              </code>{" "}
              after deploy.
            </p>
          ) : null}

          {bridge.error ? (
            <div className="mt-3 rounded-2xl bg-[#fff4e5] p-3 text-[12px] text-[#9a5b00]">
              {bridge.error}
            </div>
          ) : null}

          {bridge.log.length > 0 ? (
            <div className="mt-4 max-h-28 space-y-1 overflow-y-auto rounded-2xl bg-[#f7f7f5] p-3 font-mono text-[11px] text-[#666]">
              {bridge.log.map((l, i) => (
                <p key={`${l}-${i}`}>· {l}</p>
              ))}
            </div>
          ) : null}

          {bridge.step === "done" ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl bg-[#fdeef1] p-4 text-[13px] text-[#333]"
            >
              <div className="flex items-center gap-2 font-medium text-[#e6005c]">
                <CheckCircle2 className="h-4 w-4" /> Position live on Mezo
              </div>
              <p className="mt-2 text-[#666]">
                Wrapped {units} {asset.ticker} from{" "}
                {bridge.route.sourceChainName} and borrowed{" "}
                {formatUsd(Number(borrow))} MUSD.
              </p>
              <p className="mt-2 text-[12px] text-[#888]">
                Import MUSD and {asset.ticker} below if MetaMask doesn&apos;t
                list them. {asset.ticker} will show <strong>0</strong> in the
                wallet - that&apos;s correct; your shares are locked in the
                market (open Positions to see them).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AddMusdButton
                  label="Import MUSD in MetaMask"
                  autoPrompt
                />
                {bridge.route.mezoToken ? (
                  <AddTokenButton
                    address={bridge.route.mezoToken}
                    symbol={asset.ticker}
                    image={
                      typeof window !== "undefined"
                        ? `${window.location.origin}${asset.logo}`
                        : undefined
                    }
                    label={`Import ${asset.ticker} in MetaMask`}
                    autoPrompt
                    autoPromptDelayMs={1200}
                  />
                ) : null}
                <Link href="/positions" className="btn-primary !py-2 text-[12px]">
                  View positions
                </Link>
                <Link href="/activity" className="btn-ghost">
                  Activity
                </Link>
              </div>
            </motion.div>
          ) : null}
        </Surface>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
  action,
}: {
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#999]">
          {label}
        </span>
        {action}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[#999]">{label}</span>
      <span className="font-medium text-[#111]">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f7f5] px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-[#999]">{label}</p>
      <p className="mt-1 text-[16px] font-semibold tracking-[-0.02em] text-[#111]">
        {value}
      </p>
    </div>
  );
}
