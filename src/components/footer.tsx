"use client";

import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { PegforgeMark } from "./logo";

const pillLinks = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "Desk", href: "/forge" },
  { label: "Positions", href: "/positions" },
  { label: "Activity", href: "/activity" },
  { label: "Transact", href: "/transact" },
  { label: "Pools", href: "/pools" },
  { label: "Markets", href: "/#markets" },
  { label: "How", href: "/#how" },
];

const builtOn = [
  { label: "Mezo", href: "https://mezo.org" },
  { label: "Bitcoin", href: "https://bitcoin.org" },
  { label: "MUSD", href: "https://mezo.org/feature/musd", logo: "/tokens/musd.png" },
  { label: "tBTC", href: "https://docs.threshold.network/applications/tbtc-v2" },
  { label: "Ethereum", href: "https://ethereum.org" },
];

const assetStrip = [
  { src: "/tokens/nvda.png", alt: "NVIDIA" },
  { src: "/tokens/aapl.png", alt: "Apple" },
  { src: "/tokens/gold.png", alt: "Gold" },
  { src: "/tokens/silver.png", alt: "Silver" },
  { src: "/tokens/wti.png", alt: "Oil" },
  { src: "/tokens/musd.png", alt: "MUSD" },
];

const columns = [
  {
    title: "Product",
    links: [
      { label: "Portfolio", href: "/portfolio" },
      { label: "Desk", href: "/forge" },
      { label: "Positions", href: "/positions" },
      { label: "Activity", href: "/activity" },
      { label: "Transact", href: "/transact" },
      { label: "Pools", href: "/pools" },
      { label: "Markets", href: "/#markets" },
      { label: "How it works", href: "/#how" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Deck", href: SITE.deck },
      { label: "GitHub", href: SITE.github },
      { label: "Demo video", href: SITE.demoVideo },
      { label: "X / Twitter", href: "https://x.com/MezoNetwork" },
    ],
  },
];

function Pill({
  href,
  logo,
  children,
}: {
  href: string;
  logo?: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  const className =
    "inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-medium text-white transition hover:bg-white hover:text-[#dc062b]";
  const content = (
    <>
      {logo ? (
        <Image
          src={logo}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 rounded-full object-cover ring-1 ring-white/40"
        />
      ) : null}
      {children}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#dc062b] font-sans text-white">
      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-8 pt-10 md:px-8 md:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] lg:items-start">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <PegforgeMark variant="white" className="h-8 w-8" />
            <span className="text-[18px] font-medium tracking-[-0.03em] text-white">
              {SITE.domain}
            </span>
          </Link>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {pillLinks.map((l) => (
                <Pill key={l.label} href={l.href}>
                  {l.label}
                </Pill>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <span className="text-[12px] font-medium text-white/70">
                Built on
              </span>
              {builtOn.map((l) => (
                <Pill key={l.label} href={l.href} logo={l.logo}>
                  {l.label}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          {assetStrip.map((a) => (
            <Image
              key={a.src}
              src={a.src}
              alt={a.alt}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30"
            />
          ))}
          <span className="ml-1 text-[13px] font-medium text-white/80">
            Stocks · Gold · Oil → MUSD
          </span>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 sm:max-w-md">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-medium tracking-[-0.02em] text-white">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("http") ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[13px] text-white/75 transition hover:text-white"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-[13px] text-white/75 transition hover:text-white"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/20 pt-6">
          <p className="max-w-5xl text-[12px] leading-relaxed text-white/70 md:max-w-none md:pr-8">
            {SITE.domain} is an RWA collateral desk on Mezo testnet: Express wrap
            → deposit → borrow MUSD, plus Positions, Activity, Transact, and
            Pools. Demo for the Mezo Buildathon. Not financial advice.{" "}
            {SITE.domain} is an independent project and is not affiliated with
            or endorsed by Mezo / Thesis*.
          </p>
          <p className="mt-3 text-[12px] font-medium text-white/55">
            © 2026 {SITE.domain}
          </p>
        </div>
      </div>

      <div
        className="pointer-events-none relative z-0 select-none px-2 pb-4 pt-2 md:px-4"
        aria-hidden
      >
        <p className="whitespace-nowrap text-center text-[14vw] font-bold leading-[1.15] tracking-[-0.06em] text-white md:text-[11vw] lg:text-[9rem]">
          {SITE.domain}
        </p>
      </div>
    </footer>
  );
}
