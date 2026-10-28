"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeftRight,
  Briefcase,
  Droplets,
  Home,
  LayoutDashboard,
} from "lucide-react";
import type { ReactNode } from "react";
import { ConnectButton } from "./connect-button";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/portfolio", label: "Portfolio", short: "Home", icon: Home },
  { href: "/activity", label: "Activity", short: "Activity", icon: Activity },
  { href: "/transact", label: "Transact", short: "Move", icon: ArrowLeftRight },
  { href: "/forge", label: "Desk", short: "Desk", icon: Briefcase },
  { href: "/positions", label: "Positions", short: "Loans", icon: LayoutDashboard },
  { href: "/pools", label: "Pools", short: "Pools", icon: Droplets },
] as const;

function isActive(pathname: string | null, href: string) {
  return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
}

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="app-canvas flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[15.75rem] shrink-0 flex-col border-r border-[#ebebe8]/90 bg-white/85 backdrop-blur-xl xl:w-[16.5rem] lg:flex">
        <div className="flex h-[4.25rem] items-center px-5">
          <Logo size="sm" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 pb-4" aria-label="App">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium transition",
                  active
                    ? "bg-[#111] text-white shadow-[0_10px_24px_-16px_rgba(17,17,17,0.7)]"
                    : "text-[#555] hover:bg-black/[0.035] hover:text-[#111]",
                )}
              >
                {active ? (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#e6005c]" />
                ) : null}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition",
                    active ? "opacity-100" : "opacity-65 group-hover:opacity-100",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#ebebe8] p-4">
          <p className="px-1 text-[11px] leading-relaxed text-[#999]">
            RWA desk · gas is official Mezo Bitcoin (native BTC)
          </p>
          <a
            href="https://faucet.test.mezo.org/"
            target="_blank"
            rel="noreferrer"
            className="mt-2 block rounded-xl px-2 py-1.5 text-[12px] font-medium text-[#e6005c] transition hover:bg-[#fdeef1]"
          >
            Claim Mezo testnet BTC →
          </a>
          <Link
            href="/"
            className="mt-1 block rounded-xl px-2 py-2 text-[12px] font-medium text-[#666] transition hover:bg-black/[0.04] hover:text-[#111]"
          >
            ← Marketing site
          </Link>
        </div>
      </aside>

      <div className="app-main-pad flex min-w-0 flex-1 flex-col lg:pb-0">
        <header className="sticky top-0 z-40 border-b border-[#ebebe8]/80 bg-[#f7f7f5]/80 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-[4.25rem] sm:gap-3 sm:px-4 md:px-7">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className="min-w-0 lg:hidden">
                <Logo size="sm" compactWordmark />
              </div>
              <div className="min-w-0 max-lg:hidden lg:block">
                <p className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-[#aaa] lg:block">
                  Pegforge app
                </p>
                <div className="flex items-baseline gap-3">
                  <h1 className="truncate text-[15px] font-semibold tracking-[-0.03em] text-[#111] md:text-[17px]">
                    {title}
                  </h1>
                  {description ? (
                    <p className="hidden truncate text-[13px] text-[#888] xl:block">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>
              <h1 className="truncate text-[14px] font-semibold tracking-[-0.03em] text-[#111] lg:hidden">
                {title}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                href="/forge"
                className="btn-primary !hidden !px-4 !py-2 text-[13px] md:!inline-flex"
              >
                Desk
              </Link>
              <ConnectButton compact />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-[72rem] flex-1 px-3 py-5 sm:px-4 sm:py-6 md:px-7 md:py-8 xl:px-9">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ebebe8] bg-white/95 px-0.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl lg:hidden"
        aria-label="Mobile app"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-medium transition sm:px-1 sm:py-2 sm:text-[10px]",
                  active ? "text-[#e6005c]" : "text-[#888]",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition sm:h-8 sm:w-8",
                    active ? "bg-[#fdeef1]" : "bg-transparent",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
                <span className="max-w-full truncate">{item.short}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
