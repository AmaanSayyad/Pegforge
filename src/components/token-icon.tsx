"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
};

export function TokenIcon({ src, alt, size = 36, className }: Props) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-black/5",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

export function TokenPair({
  collateralSrc,
  collateralAlt,
  size = 40,
}: {
  collateralSrc: string;
  collateralAlt: string;
  size?: number;
}) {
  const mid = Math.round(size * 0.72);
  return (
    <span className="relative inline-flex" style={{ width: size + mid * 0.35, height: size }}>
      <TokenIcon src={collateralSrc} alt={collateralAlt} size={size} />
      <TokenIcon
        src="/tokens/musd.png"
        alt="MUSD"
        size={mid}
        className="absolute -right-1 bottom-0 ring-2 ring-white"
      />
    </span>
  );
}