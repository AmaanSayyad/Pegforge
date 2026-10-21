"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  categoryLabels,
  collateralAssets,
  PRICE_AS_OF,
  type AssetCategory,
} from "@/lib/assets";
import { mezo } from "@/lib/mezo-media";
import { formatPrice } from "@/lib/utils";
import { TokenIcon, TokenPair } from "./token-icon";

export { Footer } from "./footer";

const categories: AssetCategory[] = ["equities", "metals", "energy"];

export function BentoSection() {
  return (
    <section className="bg-[#f7f7f5] px-5 py-12 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.78fr)] lg:items-stretch">
        <div className="flex min-w-0 flex-col gap-4">
          <Link
            href="/forge"
            className="group split-pair-wide-left min-h-[240px] flex-1 overflow-hidden rounded-[1.5rem] ring-1 ring-black/[0.03] transition duration-300 hover:shadow-[0_20px_50px_-28px_rgba(17,17,17,0.45)]"
          >
            <div className="flex flex-col justify-center bg-[#f3e6d4] p-7 md:p-9">
              <h2 className="max-w-[16ch] text-[28px] font-bold tracking-[-0.04em] text-[#111] md:text-[34px]">
                Borrow with real assets
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#444]">
                Express Desk on Mezo: wrap xNVDA / gold / oil, deposit into
                RwaMUSDMarket, borrow MUSD under each asset&apos;s LTV.
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-[#111] transition group-hover:gap-2 group-hover:text-[#e6005c]">
                Open Desk →
              </span>
            </div>
            <div className="relative flex min-h-[200px] items-center justify-center bg-[#f58220] md:min-h-0">
              <Image
                src={mezo.btcToken}
                alt="Collateral graphic"
                width={220}
                height={220}
                className="drop-shadow-xl transition duration-500 group-hover:scale-105"
              />
            </div>
          </Link>

          <div className="split-pair-wide-right min-h-[220px] overflow-hidden rounded-[1.5rem]">
            <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden bg-[#fdeef1] md:min-h-0">
              <Image
                src={mezo.earnPercent}
                alt="Yield graphic"
                width={240}
                height={240}
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="flex flex-col justify-center bg-[#f8e8e8] p-7 md:p-8">
              <h2 className="max-w-[14ch] text-[26px] font-bold tracking-[-0.04em] text-[#111] md:text-[30px]">
                Keep your upside
              </h2>
              <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#444]">
                Don&apos;t sell NVDA, gold, or oil to spend. Lock it, borrow MUSD,
                keep the upside while you spend MUSD.
              </p>
              <Link
                href="/forge"
                className="mt-4 text-[14px] font-medium text-[#111] transition hover:text-[#e6005c]"
              >
                Start borrowing →
              </Link>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-[#f8e8e8] p-7 lg:min-h-full md:p-8">
          <div>
            <h2 className="max-w-[12ch] text-[26px] font-bold tracking-[-0.04em] text-[#111] md:text-[30px]">
              Stability backed by Bitcoin
            </h2>
            <p className="mt-3 max-w-[28ch] text-[14px] leading-relaxed text-[#555]">
              MUSD stays Bitcoin-backed on Mezo. pegforge.fun opens that market
              to RWA collateral - stocks, gold, silver, and oil.
            </p>
            <Link
              href="/#why"
              className="mt-5 inline-block text-[14px] font-medium text-[#111] transition hover:text-[#e6005c]"
            >
              Learn more →
            </Link>
          </div>
          <div className="relative mx-auto mt-8 h-40 w-40 shrink-0 md:h-44 md:w-44 lg:mt-auto">
            <Image
              src={mezo.btcBento}
              alt="BTC growing"
              fill
              className="object-contain"
              sizes="176px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeatureArtSection() {
  const cards = [
    {
      title: "Stocks",
      body: "xNVDA, xAAPL, xMSFT and more as MUSD collateral.",
      art: mezo.earnVault,
      logos: collateralAssets
        .filter((a) => a.category === "equities")
        .slice(0, 4)
        .map((a) => a.logo),
    },
    {
      title: "Metals",
      body: "Tokenized gold & silver ounces - higher LTV bands.",
      art: mezo.percentCrop,
      logos: ["/tokens/gold.png", "/tokens/silver.png"],
    },
    {
      title: "Energy",
      body: "WTI crude barrels posted into the same MUSD market.",
      art: mezo.earnPools,
      logos: ["/tokens/wti.png"],
    },
    {
      title: "MUSD out",
      body: "Borrow on Desk, send in Transact, track every step in Activity.",
      art: mezo.musdMintCard,
      logos: ["/tokens/musd.png", "/tokens/btc.png"],
    },
  ];

  return (
    <section className="bg-[#f7f7f5] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="eyebrow">Collateral classes</p>
        <h2 className="section-title max-w-5xl md:max-w-none">
          Stocks, metals, and energy as MUSD collateral.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href="/forge"
                className="card-mezo card-mezo-hover block overflow-hidden"
              >
                <div className="relative aspect-[5/3.2] overflow-hidden bg-[#111]">
                  <Image
                    src={c.art}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 px-3">
                    {c.logos.map((src) => (
                      <TokenIcon
                        key={src}
                        src={src}
                        alt=""
                        size={36}
                        className="shadow-md ring-2 ring-white"
                      />
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-[18px] font-semibold tracking-[-0.03em] text-[#111]">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#666]">
                    {c.body}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BorrowVisualSection() {
  return (
    <section className="relative overflow-hidden bg-[#f7f7f5] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <Image
          src={mezo.borrowBg}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#f7f7f5]/80" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
        <div className="relative mx-auto mb-8 h-36 w-36 md:h-44 md:w-44">
          <Image
            src={mezo.btcToken}
            alt="Bitcoin token"
            fill
            className="object-contain drop-shadow-lg"
            sizes="176px"
          />
        </div>
        <h2 className="font-serif text-[36px] font-medium leading-[1.1] tracking-[-0.03em] text-[#111] md:text-[48px]">
          Capitalize on what you hold.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-[#555]">
          Live on Mezo testnet: wrap → deposit → borrow in a few MetaMask
          confirms. Track Activity, repay in Positions, move MUSD in Transact.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/forge" className="btn-primary px-8">
            Open Desk
          </Link>
          <Link href="/portfolio" className="btn-secondary px-8">
            Open app
          </Link>
        </div>
      </div>
    </section>
  );
}

export function MarketsSection() {
  return (
    <section id="markets" className="bg-[#f7f7f5] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-5xl">
          <p className="eyebrow">Allowlisted collateral</p>
          <h2 className="section-title max-w-none">
            Come with what you already hold.
          </h2>
          <p className="mt-4 max-w-4xl text-[17px] leading-relaxed text-[#666] md:text-[18px]">
            Famous US equities, precious metals, and energy - each with its own
            LTV and liquidation band. Marks as of {PRICE_AS_OF}.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {categories.map((cat) => {
            const list = collateralAssets.filter((a) => a.category === cat);
            return (
              <div key={cat}>
                <h3 className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#999]">
                  {categoryLabels[cat]}
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        href="/forge"
                        className="card-mezo card-mezo-hover block p-5"
                      >
                        <div className="flex items-start gap-3">
                          <TokenPair
                            collateralSrc={a.logo}
                            collateralAlt={a.name}
                            size={44}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-[18px] font-semibold tracking-[-0.03em] text-[#111]">
                                {a.name}
                              </p>
                              <span className="font-mono text-[12px] text-[#e6005c]">
                                {a.ticker}
                              </span>
                            </div>
                            <p className="mt-1.5 text-[13px] text-[#666]">
                              {a.blurb}
                            </p>
                            <p className="mt-2 text-[13px] font-medium text-[#111]">
                              {formatPrice(a.priceUsd)}
                              <span className="font-normal text-[#999]">
                                {" "}
                                / {a.unit} · {a.maxLtvPercent}% LTV
                              </span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/forge" className="btn-secondary mt-12">
          Borrow against any of these
        </Link>
      </div>
    </section>
  );
}

export function WhySection() {
  const flowAssets = collateralAssets.filter((a) =>
    ["nvda", "gold", "wti", "aapl"].includes(a.id),
  );

  return (
    <section id="why" className="bg-[#f7f7f5] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-5xl">
          <p className="eyebrow">Why Mezo needs this</p>
          <h2 className="section-title max-w-none">
            More people. More collateral.{" "}
            <span className="text-gradient-mezo">More MUSD demand.</span>
          </h2>
          <p className="mt-4 max-w-4xl text-[17px] leading-relaxed text-[#666] md:text-[18px]">
            Mezo&apos;s BTC CDP already works: lock BTC, mint MUSD, liquidate
            undercollateralized positions. pegforge.fun runs that same
            mechanism for tokenized equities and commodities.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          {flowAssets.map((a) => (
            <TokenIcon
              key={a.id}
              src={a.logo}
              alt={a.name}
              size={48}
              className="shadow-sm ring-2 ring-white"
            />
          ))}
          <span className="px-2 text-[18px] font-medium text-[#999]">→</span>
          <TokenIcon
            src="/tokens/musd.png"
            alt="MUSD"
            size={48}
            className="shadow-sm ring-2 ring-white"
          />
        </div>

        <div className="split-equal mt-10">
          <div className="card-mezo h-full p-6 md:p-8">
            <p className="text-[13px] font-medium text-[#999]">Mezo BTC CDP</p>
            <ul className="mt-4 space-y-3 text-[15px] text-[#444]">
              <li className="flex gap-2">
                <span className="text-[#e6005c]">·</span> Lock BTC as collateral
              </li>
              <li className="flex gap-2">
                <span className="text-[#e6005c]">·</span> Mint MUSD under LTV
              </li>
              <li className="flex gap-2">
                <span className="text-[#e6005c]">·</span> Liquidate if CR breaks
              </li>
            </ul>
          </div>
          <div className="card-mezo h-full border-[#e6005c]/30 bg-[#fdeef1] p-6 md:p-8">
            <p className="text-[13px] font-medium text-[#e6005c]">pegforge.fun</p>
            <ul className="mt-4 space-y-3 text-[15px] text-[#333]">
              <li className="flex gap-2">
                <span className="text-[#e6005c]">·</span> Wrap stocks / gold / oil on Mezo
              </li>
              <li className="flex gap-2">
                <span className="text-[#e6005c]">·</span> Per-asset LTV + oracle marks
              </li>
              <li className="flex gap-2">
                <span className="text-[#e6005c]">·</span> Borrow MUSD · repay in Positions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowSection() {
  const steps = [
    {
      n: "01",
      title: "Pick collateral",
      body: "Choose xNVDA, gold, silver, WTI, and more on the Desk - live marks and LTV bands.",
      img: mezo.earnVault,
    },
    {
      n: "02",
      title: "Wrap on Mezo",
      body: "Express: 1 Mezo confirm. Full: lock mock RWA on Sepolia/Base, then claim that lockId on Mezo to borrow.",
      img: mezo.earnLock,
    },
    {
      n: "03",
      title: "Borrow MUSD",
      body: "Deposit into RwaMUSDMarket and borrow under max LTV. Desk liquidity backs the loan; keep upside on the asset.",
      img: mezo.musdMintCard,
    },
    {
      n: "04",
      title: "Manage",
      body: "Repay or withdraw in Positions, review Activity, send MUSD in Transact, watch Pools liquidity.",
      img: mezo.earnPools,
    },
  ];

  return (
    <section id="how" className="bg-[#f7f7f5] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="eyebrow">How it works</p>
        <h2 className="section-title">Wrap. Deposit. Borrow. Manage.</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card-mezo card-mezo-hover overflow-hidden"
            >
              <div className="relative aspect-[5/3.2] overflow-hidden bg-[#111]">
                <Image
                  src={s.img}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover object-[center_35%]"
                  sizes="(max-width: 768px) 100vw, 280px"
                />
              </div>
              <div className="p-6">
                <span className="text-[28px] font-bold text-[#e6005c]">
                  {s.n}
                </span>
                <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#111]">
                  {s.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#666]">
                  {s.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <Link href="/forge" className="btn-secondary mt-10">
          Open the desk
        </Link>
      </div>
    </section>
  );
}

export function AppMapSection() {
  const primary = [
    {
      href: "/portfolio",
      label: "Portfolio",
      eyebrow: "Home",
      body: "Mezo BTC gas, MUSD, and open RWA loans in one book.",
      art: mezo.homeBento,
      cta: "Open home",
    },
    {
      href: "/forge",
      label: "Desk",
      eyebrow: "Borrow",
      body: "Express: one MetaMask confirm. Full: lock on Sepolia/Base, then claim on Mezo.",
      art: mezo.earnVault,
      cta: "Open desk",
    },
  ] as const;

  const rail = [
    {
      href: "/positions",
      label: "Positions",
      body: "Repay · withdraw · MetaMask import",
      n: "03",
    },
    {
      href: "/activity",
      label: "Activity",
      body: "Wraps, borrows, explorer links",
      n: "04",
    },
    {
      href: "/transact",
      label: "Transact",
      body: "Send Mezo BTC gas & MUSD",
      n: "05",
    },
    {
      href: "/pools",
      label: "Pools",
      body: "Desk liquidity + MUSD/BTC AMM",
      n: "06",
    },
  ] as const;

  return (
    <section id="app" className="relative overflow-hidden bg-[#f7f7f5] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#fdeef1]/70 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 flex-1 md:pr-8">
            <p className="eyebrow">Inside the app</p>
            <h2 className="section-title max-w-none">Live on Mezo testnet.</h2>
            <p className="mt-4 max-w-4xl text-[17px] leading-relaxed text-[#666] md:text-[18px]">
              Wrap, borrow, repay, and move funds. Gas is official Mezo Bitcoin;
              loans are RWA → MUSD on the Desk.
            </p>
          </div>
          <Link href="/portfolio" className="btn-primary shrink-0 self-start md:self-auto">
            Enter app
          </Link>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {primary.map((a, i) => (
            <motion.div
              key={a.href}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={a.href}
                className="group relative flex min-h-[220px] overflow-hidden rounded-[1.5rem] bg-[#111] shadow-[0_24px_60px_-40px_rgba(17,17,17,0.65)]"
              >
                <Image
                  src={a.art}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover object-center opacity-55 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-70"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                <div className="relative z-10 flex w-full flex-col justify-end p-6 md:p-8">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ff7aa8]">
                    {a.eyebrow}
                  </span>
                  <h3 className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-white md:text-[32px]">
                    {a.label}
                  </h3>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/75">
                    {a.body}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-white transition group-hover:gap-2">
                    {a.cta} <span className="text-[#e6005c]">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#999]">
              Keep going
            </p>
            <p className="text-[12px] text-[#bbb] md:hidden">Swipe →</p>
          </div>
          <div className="scroll-soft -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 md:gap-3 md:overflow-visible md:px-0 md:pb-0">
            {rail.map((a, i) => (
              <motion.div
                key={a.href}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 + i * 0.04 }}
                className="min-w-[78%] snap-start sm:min-w-[45%] md:min-w-0"
              >
                <Link
                  href={a.href}
                  className="card-mezo card-mezo-hover flex h-full flex-col p-5"
                >
                  <span className="font-mono text-[12px] font-semibold tracking-wider text-[#e6005c]">
                    {a.n}
                  </span>
                  <p className="mt-3 text-[17px] font-semibold tracking-[-0.03em] text-[#111]">
                    {a.label}
                  </p>
                  <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[#666]">
                    {a.body}
                  </p>
                  <span className="mt-4 text-[13px] font-medium text-[#e6005c]">
                    Open →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
