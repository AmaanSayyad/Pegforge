"use client";

import { Check, Loader2, Plus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Address } from "viem";
import { useAccount, useSwitchChain } from "wagmi";
import { addTokenToWallet } from "@/lib/add-token";
import { mezoTestnet } from "@/lib/chains";
import { MUSD_ADDRESS } from "@/lib/contracts";
import { cn } from "@/lib/utils";

const MUSD = MUSD_ADDRESS[mezoTestnet.id];

type BtnState = "idle" | "pending" | "ok" | "fail";

function MetaMaskMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 35 33"
      fill="none"
      aria-hidden
      className={cn("h-3.5 w-3.5 shrink-0", className)}
    >
      <path
        d="M32.96 1 19.72 10.86l2.45-5.77L32.96 1Z"
        fill="#E17726"
        stroke="#E17726"
        strokeWidth=".25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m2.04 1 13.13 9.95-2.34-5.86L2.04 1Zm27.38 22.35-.01.1-4.63 7.08-2.1-.01 4.18-10.06 2.56 2.89Zm-23.7.01 2.55-2.9 4.2 10.07-2.1.01-4.65-7.18Zm17.5-11.84-2.34 3.56 5.23.24-.19-5.64 2.45-.02-4.15 1.86Zm-11.52 0-5.15-1.86 2.45.02-.17 5.64 5.21-.24-2.34-3.56Z"
        fill="#E2761B"
        stroke="#E2761B"
        strokeWidth=".25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m10.97 24.46 4.14-2.02-3.56-2.72-.58 4.74Zm13.06 0-.59-4.75-3.55 2.73 4.14 2.02ZM14.97 15.07l-1.47 4.45 5.23.24.19-5.64-3.95.95Zm5.06 0-3.95-.95.17 5.64 5.25-.24-1.47-4.45Z"
        fill="#E2761B"
        stroke="#E2761B"
        strokeWidth=".25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

async function ensureMezo(
  chainId: number | undefined,
  switchChainAsync: ReturnType<typeof useSwitchChain>["switchChainAsync"],
) {
  if (chainId === mezoTestnet.id) return;
  try {
    await switchChainAsync({ chainId: mezoTestnet.id });
  } catch {
    // User may reject; watchAsset can still prompt on current chain
  }
}

function useAddTokenAction(opts: {
  address: Address;
  symbol: string;
  image?: string;
}) {
  const { chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [state, setState] = useState<BtnState>("idle");
  const [hint, setHint] = useState<string | null>(null);

  const run = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (!isConnected) {
        setHint("Connect wallet first");
        setState("fail");
        return;
      }
      setState("pending");
      setHint(null);
      await ensureMezo(chainId, switchChainAsync);
      const res = await addTokenToWallet({
        address: opts.address,
        symbol: opts.symbol,
        decimals: 18,
        image:
          opts.image && opts.image.startsWith("https://")
            ? opts.image
            : undefined,
        chainId: mezoTestnet.id,
      });
      setState(res.ok ? "ok" : "fail");
      setHint(res.ok ? null : res.error ?? "Could not add token");
      if (res.ok) setTimeout(() => setState("idle"), 2800);
    },
    [
      chainId,
      isConnected,
      opts.address,
      opts.image,
      opts.symbol,
      switchChainAsync,
    ],
  );

  return { state, hint, run };
}

export function WalletTokenChip({
  symbol,
  state,
  onClick,
  leading,
  idleLabel,
  className,
  size = "md",
}: {
  symbol: string;
  state: BtnState;
  onClick: (e: React.MouseEvent) => void;
  leading?: ReactNode;
  idleLabel?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const label =
    idleLabel ??
    (size === "sm" ? `Add ${symbol}` : `Add ${symbol} to MetaMask`);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "pending"}
      title={`Import ${symbol} into MetaMask`}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-60",
        size === "sm"
          ? "px-3 py-1.5 text-[11.5px]"
          : "px-3.5 py-2 text-[12.5px]",
        state === "ok"
          ? "bg-[#ecf3e5] text-[#2d5a32] ring-1 ring-[#cfe0c4]"
          : state === "fail"
            ? "bg-[#fff4e5] text-[#9a5b00] ring-1 ring-[#f0d9b0]"
            : "bg-white text-[#111] ring-1 ring-[#ebebe8] hover:bg-[#fdeef1] hover:text-[#c4004a] hover:ring-[#f0d4dc]",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full",
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          state === "idle" || state === "pending"
            ? "text-[#666] group-hover:text-[#e6005c]"
            : "bg-transparent",
        )}
      >
        {state === "pending" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : state === "ok" ? (
          <Check className="h-3.5 w-3.5" />
        ) : state === "fail" ? (
          <Plus className="h-3.5 w-3.5 rotate-45" />
        ) : (
          leading ?? <MetaMaskMark />
        )}
      </span>
      <span className="whitespace-nowrap">
        {state === "ok"
          ? `${symbol} added`
          : state === "fail"
            ? "Try again"
            : label}
      </span>
    </button>
  );
}

export function AddMusdButton({
  className,
  label,
  size = "md",
  autoPrompt = false,
}: {
  className?: string;
  label?: string;
  size?: "sm" | "md";
  /** Fire wallet_watchAsset once when mounted (e.g. after a successful loan). */
  autoPrompt?: boolean;
}) {
  const { state, hint, run } = useAddTokenAction({
    address: MUSD,
    symbol: "MUSD",
  });
  const prompted = useRef(false);

  useEffect(() => {
    if (!autoPrompt || prompted.current) return;
    prompted.current = true;
    void run();
  }, [autoPrompt, run]);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <WalletTokenChip
        symbol="MUSD"
        state={state}
        onClick={run}
        className={className}
        size={size}
        idleLabel={label}
      />
      {hint ? (
        <span className="max-w-[16rem] text-[11px] leading-snug text-[#9a5b00]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function AddTokenButton({
  address,
  symbol,
  image,
  className,
  size = "md",
  label,
  autoPrompt = false,
  autoPromptDelayMs = 0,
}: {
  address: Address;
  symbol: string;
  image?: string;
  className?: string;
  size?: "sm" | "md";
  label?: string;
  autoPrompt?: boolean;
  /** Stagger after MUSD so MetaMask isn't hit with two prompts at once. */
  autoPromptDelayMs?: number;
}) {
  const { state, hint, run } = useAddTokenAction({ address, symbol, image });
  const prompted = useRef(false);

  useEffect(() => {
    if (!autoPrompt || prompted.current) return;
    prompted.current = true;
    const t = window.setTimeout(() => {
      void run();
    }, autoPromptDelayMs);
    return () => window.clearTimeout(t);
  }, [autoPrompt, autoPromptDelayMs, run]);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <WalletTokenChip
        symbol={symbol}
        state={state}
        onClick={run}
        className={className}
        size={size}
        idleLabel={label}
      />
      {hint ? (
        <span className="max-w-[14rem] text-[11px] leading-snug text-[#9a5b00]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/** Paired MetaMask import actions for position / portfolio cards */
export function WalletImportStrip({
  collateral,
  note,
}: {
  collateral?: {
    address: Address;
    symbol: string;
    image?: string;
  };
  note?: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f7f7f5] p-3.5 ring-1 ring-[#ebebe8]/90 md:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 max-w-xl">
          <p className="text-[12px] font-semibold tracking-[-0.01em] text-[#111]">
            Show in MetaMask
          </p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-[#888]">
            {note ??
              "Import so the token appears in MetaMask. Locked collateral balance is 0 in your wallet - the shares sit in the market (see this position card), not in MetaMask."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AddMusdButton size="sm" label="Add MUSD" />
          {collateral ? (
            <AddTokenButton
              address={collateral.address}
              symbol={collateral.symbol}
              image={collateral.image}
              size="sm"
              label={`Add ${collateral.symbol}`}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
