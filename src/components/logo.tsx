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
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <PegforgeMark className={size === "sm" ? "h-7 w-7" : "h-9 w-9"} />
      <span
        className={cn(
          "font-medium tracking-[-0.03em] text-[#111]",
          size === "sm" ? "text-[17px]" : "text-[19px]",
        )}
      >
        {SITE.domain}
      </span>
    </Link>
  );
}
