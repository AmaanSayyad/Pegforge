"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectButton } from "./connect-button";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#markets", label: "Markets", id: "markets" },
  { href: "/#how", label: "How", id: "how" },
  { href: "/#app", label: "Inside", id: "app" },
  { href: "/#why", label: "Why Mezo", id: "why" },
] as const;

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      setActive(null);
      return;
    }

    const sections = ["markets", "how", "app", "why"];
    const observers: IntersectionObserver[] = [];

    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-[#f7f7f5]/85 backdrop-blur-xl transition-shadow",
        scrolled ? "shadow-[0_10px_30px_-20px_rgba(0,0,0,0.28)]" : "shadow-none",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-5 md:h-[68px] md:px-8">
        <Logo size="sm" compactWordmark className="min-w-0" />

        <nav
          className="hidden items-center rounded-full bg-white/80 p-1 ring-1 ring-black/[0.04] md:flex"
          aria-label="Primary"
        >
          {links.map((l) => {
            const isActive = active === l.id;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
                  isActive
                    ? "bg-[#111] text-white"
                    : "text-[#444] hover:bg-[#f3f3f3] hover:text-[#111]",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="/portfolio"
            className="!hidden rounded-full bg-[#e6005c] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#c4004a] md:!inline-flex"
          >
            App
          </Link>
          <ConnectButton compact />

          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#111] ring-1 ring-black/[0.04] md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-3.5 w-4">
              <span
                className={cn(
                  "absolute left-0 block h-[1.5px] w-full bg-current transition",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 block h-[1.5px] w-full bg-current transition",
                  open ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-[1.5px] w-full bg-current transition",
                  open ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="bg-[#f7f7f5] md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4" aria-label="Mobile">
            {links.map((l) => {
              const isActive = active === l.id;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-[15px] font-medium transition",
                    isActive
                      ? "bg-[#111] text-white"
                      : "text-[#222] hover:bg-white",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/portfolio"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-2xl bg-[#e6005c] px-4 py-3 text-center text-[15px] font-medium text-white"
            >
              Open App
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
