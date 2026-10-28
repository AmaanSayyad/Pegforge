"use client";

import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Pegforge Pegasus mark in Mezo brand pink (#e6005c / #dc062b family) */
export function PegforgeMark({
  className,
  variant = "brand",
}: {
  className?: string;
  variant?: "brand" | "white";
  /** @deprecated kept for call-site compat */
  color?: string;
}) {
  return (
    <Image
      src={
        variant === "white" ? "/pegforge-mark-white.png" : "/pegforge-mark.png"
      }
      alt=""
      width={64}
      height={64}
      className={cn("h-8 w-8 object-contain", className)}
      aria-hidden
      priority
    />
  );
}

export function Logo({
  className,
  size = "md",
  compactWordmark = false,
}: {
  className?: string;
  size?: "sm" | "md";
  /** Hide the domain text on very narrow screens (keeps mark + tap target). */
  compactWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex min-w-0 items-center gap-2 sm:gap-2.5", className)}
    >
      <PegforgeMark
        className={cn(
          "shrink-0",
          size === "sm" ? "h-7 w-7" : "h-9 w-9",
        )}
      />
      <span
        className={cn(
          "truncate font-medium tracking-[-0.03em] text-[#111]",
          size === "sm" ? "text-[15px] sm:text-[17px]" : "text-[17px] sm:text-[19px]",
          compactWordmark && "max-sm:hidden",
        )}
      >
        {SITE.domain}
      </span>
    </Link>
  );
}
