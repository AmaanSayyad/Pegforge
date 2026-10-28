"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageBanner({
  src,
  alt = "",
  children,
  className,
  focus = "object-center",
}: {
  src: string;
  alt?: string;
  children?: ReactNode;
  className?: string;
  /** Tailwind object-position utility for the art half */
  focus?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-6 grid min-h-[11.5rem] overflow-hidden rounded-[1.5rem] border border-[#ebebe8] bg-[#111] md:mb-7 md:min-h-[13rem] md:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.1fr)]",
        className,
      )}
    >
      <div className="relative z-10 order-2 flex flex-col justify-center gap-2.5 px-4 py-5 sm:gap-3 sm:px-5 sm:py-6 md:order-1 md:px-7 md:py-8">
        {children}
      </div>
      {/* Full-bleed cover — padded 1600×721 arts keep chrome card borders inside the frame */}
      <div className="relative order-1 min-h-[8.5rem] overflow-hidden bg-[#111] sm:min-h-[9.5rem] md:order-2 md:min-h-full">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          unoptimized
          className={cn("object-cover", focus)}
          sizes="(max-width: 768px) 100vw, 55vw"
          style={{ transform: "scale(1.02)" }}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-14 bg-gradient-to-r from-[#111] to-transparent md:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#111] to-transparent md:hidden" />
      </div>
    </motion.div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  banner,
  bannerFocus,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  banner?: string;
  bannerFocus?: string;
}) {
  return (
    <div className="mb-7 sm:mb-8">
      {banner ? (
        <PageBanner src={banner} focus={bannerFocus}>
          {eyebrow ? (
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/65">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-[16ch] text-[22px] font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-[26px] md:text-[32px]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-[36ch] text-[13px] leading-relaxed text-white/72 sm:text-[14px] md:text-[15px]">
              {description}
            </p>
          ) : null}
          {action ? <div className="pt-1">{action}</div> : null}
        </PageBanner>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
        >
          <div className="min-w-0 max-w-2xl">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h1
              className={cn(
                "font-semibold tracking-[-0.04em] text-[#111]",
                eyebrow
                  ? "mt-2 text-[28px] md:text-[34px]"
                  : "text-[26px] md:text-[32px]",
              )}
            >
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[#666] md:text-[16px]">
                {description}
              </p>
            ) : null}
          </div>
          {action ? (
            <div className="shrink-0 sm:justify-self-end sm:pb-1">{action}</div>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}

export function Surface({
  children,
  className,
  hover,
  pad = "md",
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  pad?: "sm" | "md" | "lg" | "none";
}) {
  const pads = {
    none: "",
    sm: "p-4",
    md: "p-5 md:p-6",
    lg: "p-6 md:p-8",
  };
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border border-[#ebebe8] bg-white shadow-[0_1px_0_rgba(17,17,17,0.03)]",
        hover && "card-mezo-hover",
        pads[pad],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "pink" | "good" | "warn";
}) {
  const tones = {
    default: "bg-[#f7f7f5]",
    pink: "bg-[#fdeef1]",
    good: "bg-emerald-50",
    warn: "bg-amber-50",
  };
  return (
    <div className={cn("rounded-[1.15rem] px-4 py-3.5", tones[tone])}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a8a]">
        {label}
      </p>
      <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.03em] text-[#111] tabular-nums md:text-[22px]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-[12px] text-[#777]">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Surface className="overflow-hidden text-center" pad="lg">
      <div className="mx-auto flex max-w-md flex-col items-center py-4 md:py-6">
        <div className="relative mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[#fdeef1]" />
          <span className="absolute inset-2 rounded-full bg-white ring-1 ring-[#f0d4dc]" />
          <span className="relative scale-110 text-[#e6005c]">{icon}</span>
        </div>
        <h3 className="text-[18px] font-semibold tracking-[-0.03em] text-[#111]">
          {title}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-[#666]">{body}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </Surface>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
  layoutId = "segment-pill",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  className?: string;
  layoutId?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap gap-1 rounded-full bg-white p-1 ring-1 ring-black/[0.05]",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "relative rounded-full px-3 py-1.5 text-[12px] font-medium transition sm:px-4 sm:py-2 sm:text-[13px]",
              active ? "text-white" : "text-[#666] hover:bg-[#f3f3f3] hover:text-[#111]",
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-[#111]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function LtvBar({
  ltv,
  max,
  liq,
}: {
  ltv: number;
  max: number;
  liq: number;
}) {
  const fill = Math.min(100, (ltv / Math.max(liq, 1)) * 100);
  const tone =
    ltv >= liq * 0.9
      ? "bg-[#e6005c]"
      : ltv >= max * 0.85
        ? "bg-[#f58220]"
        : "bg-[#111]";
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[11px] uppercase tracking-wide text-[#999]">
        <span>LTV vs liquidation</span>
        <span>
          {ltv.toFixed(1)}% / {liq}%
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-[#f0f0ee]">
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full", tone)}
          initial={{ width: 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
        <span
          className="absolute top-0 h-full w-px bg-[#bbb]"
          style={{ left: `${(max / liq) * 100}%` }}
          title={`Max ${max}%`}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-[#aaa]">
        <span>0%</span>
        <span>Max {max}%</span>
        <span>Liq {liq}%</span>
      </div>
    </div>
  );
}

export function SoftLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const className =
    "group flex items-center justify-between gap-3 rounded-[1.05rem] bg-[#f7f7f5] px-4 py-3.5 text-[14px] font-medium text-[#222] transition hover:bg-[#f0efeb]";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HealthPill({ ltv, max, liq }: { ltv: number; max: number; liq: number }) {
  const label =
    ltv >= liq * 0.9 ? "At risk" : ltv >= max * 0.85 ? "Elevated" : "Healthy";
  const cls =
    ltv >= liq * 0.9
      ? "bg-[#fdeef1] text-[#e6005c]"
      : ltv >= max * 0.85
        ? "bg-amber-50 text-amber-800"
        : "bg-emerald-50 text-emerald-800";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        cls,
      )}
    >
      {label} · {ltv.toFixed(1)}%
    </span>
  );
}
