"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { collateralAssets } from "@/lib/assets";
import { mezo } from "@/lib/mezo-media";
import { TokenIcon } from "./token-icon";

const heroTokens = [
  ...collateralAssets.filter((a) =>
    ["nvda", "aapl", "gold", "silver", "wti", "tsla"].includes(a.id),
  ),
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f7f7f5]">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={mezo.borrowBg}
          alt=""
          fill
          priority
          className="object-cover object-center scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#f7f7f5]/72" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f7f7f5] to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[min(78svh,820px)] max-w-4xl flex-col items-center justify-center px-5 py-20 text-center md:px-8 md:py-28">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="eyebrow"
        >
          Mezo testnet · RWA → MUSD desk
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="mt-4 font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.03em] text-black md:text-[64px]"
        >
          Borrow against stocks, gold & oil
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-5 max-w-xl text-[17px] leading-relaxed text-[#444] md:text-[18px]"
        >
          Express Desk wraps collateral on Mezo, locks it in the market, and
          borrows MUSD under LTV - then manage loans in Positions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-8 flex items-center justify-center -space-x-2.5"
        >
          {heroTokens.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.14 + i * 0.03 }}
              whileHover={{ y: -4, zIndex: 10 }}
              className="relative"
            >
              <TokenIcon
                src={t.logo}
                alt={t.name}
                size={48}
                className="shadow-md ring-2 ring-white"
              />
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            whileHover={{ y: -4, zIndex: 10 }}
            className="relative"
          >
            <TokenIcon
              src="/tokens/musd.png"
              alt="MUSD"
              size={48}
              className="shadow-md ring-2 ring-white"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/forge" className="btn-primary px-8">
            Borrow now
          </Link>
          <Link href="/portfolio" className="btn-secondary px-8">
            Open app
          </Link>
          <Link
            href="/#markets"
            className="text-[14px] font-medium text-[#555] underline-offset-4 transition hover:text-[#111] hover:underline"
          >
            See markets
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
