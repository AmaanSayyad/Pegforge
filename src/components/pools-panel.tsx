"use client";

import { Droplets, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { mezoTestnet } from "@/lib/chains";
import { erc20Abi, MUSD_ADDRESS, RWA_MARKET_ADDRESS } from "@/lib/contracts";
import { pageArt, pageArtFocus } from "@/lib/mezo-media";
import { MEZO_MUSD_BTC_POOL } from "@/lib/tokens";
import { formatUsd, shortAddress } from "@/lib/utils";
import { FadeIn, PageHeader, SoftLink, StatTile, Surface } from "./ui";

const MARKET = RWA_MARKET_ADDRESS[mezoTestnet.id];
const MUSD = MUSD_ADDRESS[mezoTestnet.id];

export function PoolsPanel() {
  const { isConnected } = useAccount();
  const { data: marketMusd } = useReadContract({
    address: MUSD,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: MARKET ? [MARKET] : undefined,
    chainId: mezoTestnet.id,
    query: { enabled: Boolean(MARKET) },
  });

  const liquidity =
    marketMusd !== undefined
      ? Number(formatUnits(marketMusd, 18))
      : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Liquidity"
        title="Pools"
        description="Pegforge credit liquidity for RWA borrows, plus Mezo’s MUSD/BTC AMM."
        banner={pageArt.pools}
        bannerFocus={pageArtFocus.pools}
      />

      <div className="split-equal">
        <FadeIn className="min-w-0 h-full">
          <Surface className="relative h-full overflow-hidden" pad="lg">
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdeef1] px-2.5 py-1 text-[11px] font-semibold text-[#e6005c]">
                <Droplets className="h-3.5 w-3.5" /> Pegforge desk
              </span>
              <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.03em]">
                MUSD borrow liquidity
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#666]">
                Seeded MUSD in{" "}
                <code className="rounded bg-[#f7f7f5] px-1.5 py-0.5 text-[12px]">
                  RwaMUSDMarket
                </code>{" "}
                backs stock / gold / oil loans. Not an AMM - a credit pool.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <StatTile
                  label="Market MUSD"
                  value={
                    liquidity !== undefined
                      ? liquidity.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : "-"
                  }
                  hint={liquidity !== undefined ? formatUsd(liquidity) : undefined}
                  tone="pink"
                />
                <StatTile
                  label="Your path"
                  value="Desk → Loan"
                  hint="Bridge, deposit, borrow"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/forge" className="btn-primary !py-2.5 text-[13px]">
                  Open Desk
                </Link>
                <Link href="/positions" className="btn-secondary !py-2.5 text-[13px]">
                  Positions
                </Link>
              </div>
              {MARKET ? (
                <p className="mt-4 font-mono text-[11px] text-[#aaa]">
                  {shortAddress(MARKET)} · full address in explorer
                </p>
              ) : null}
            </div>
          </Surface>
        </FadeIn>

        <FadeIn delay={0.06} className="min-w-0 h-full">
          <Surface className="h-full" pad="lg">
            <span className="inline-flex rounded-full bg-[#111] px-2.5 py-1 text-[11px] font-semibold text-white">
              Mezo AMM
            </span>
            <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.03em]">
              {MEZO_MUSD_BTC_POOL.label}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#666]">
              Trade or LP MUSD/BTC on Mezo. Pegforge deep-links you there for
              add / remove / stake - we don&apos;t host LP math.
            </p>

            <ul className="mt-5 space-y-2">
              <li className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[1.05rem] bg-[#f7f7f5] px-4 py-3 text-[13px]">
                <span className="text-[#777]">Pool</span>
                <span className="justify-self-end font-mono text-[12px]">
                  {shortAddress(MEZO_MUSD_BTC_POOL.address)}
                </span>
              </li>
              <li className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[1.05rem] bg-[#f7f7f5] px-4 py-3 text-[13px]">
                <span className="text-[#777]">Type</span>
                <span className="justify-self-end font-medium">Basic Volatile vAMM</span>
              </li>
            </ul>

            <div className="mt-5 space-y-2">
              <SoftLink href={MEZO_MUSD_BTC_POOL.url} external>
                Open pool on Mezo
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </SoftLink>
              <SoftLink href={MEZO_MUSD_BTC_POOL.poolsUrl} external>
                Browse all Mezo pools
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </SoftLink>
            </div>
            {!isConnected ? (
              <p className="mt-4 text-[12px] text-[#888]">
                Connect a wallet on Mezo to see LP deposits there.
              </p>
            ) : null}
          </Surface>
        </FadeIn>
      </div>
    </div>
  );
}
