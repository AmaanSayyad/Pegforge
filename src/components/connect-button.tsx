"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { cn, shortAddress } from "@/lib/utils";

export function ConnectButton({ compact }: { compact?: boolean }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => open({ view: "Account" })}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-[#f0d4dc] bg-gradient-to-b from-white to-[#fdeef1]/70 font-medium text-[#111] shadow-[0_8px_20px_-16px_rgba(230,0,92,0.55)] transition hover:border-[#e6005c]/45 hover:to-[#fdeef1]",
          compact ? "px-3 py-2 text-[12px]" : "px-4 py-2.5 text-[13px]",
        )}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#e6005c]/40" />
          <span className="relative h-2 w-2 rounded-full bg-[#e6005c]" />
        </span>
        <span className="font-mono tracking-tight">{shortAddress(address)}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open()}
      className={cn(
        "btn-primary shrink-0 whitespace-nowrap",
        compact
          ? "!px-3 !py-2 text-[12px] sm:!px-4 sm:text-[13px]"
          : "px-5 py-2.5 text-[14px]",
      )}
    >
      <span className="sm:hidden">{compact ? "Connect" : "Connect wallet"}</span>
      <span className="hidden sm:inline">Connect wallet</span>
    </button>
  );
}
