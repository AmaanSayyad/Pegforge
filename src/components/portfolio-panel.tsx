"use client";

import Link from "next/link";
import { Briefcase, LayoutDashboard, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { formatUnits, type Address } from "viem";
import { collateralAssets } from "@/lib/assets";
import { erc20Abi, MUSD_ADDRESS } from "@/lib/contracts";
import { mezoTestnet } from "@/lib/chains";
import { MEZO_MUSD_BTC_POOL, mezoRwaTokens } from "@/lib/tokens";
import { formatUsd, shortAddress } from "@/lib/utils";
import { usePositions } from "@/hooks/use-positions";
import { pageArt, pageArtFocus } from "@/lib/mezo-media";
import { AddMusdButton } from "./add-musd-button";
import { TokenIcon } from "./token-icon";
import {
  EmptyState,
  FadeIn,
  HealthPill,
  PageHeader,
  SoftLink,
  StatTile,
  Surface,
} from "./ui";

const MUSD = MUSD_ADDRESS[mezoTestnet.id];

export function PortfolioPanel() {
  const { address, isConnected } = useAccount();
  const { positions, totals } = usePositions();

  const { data: btc } = useBalance({
    address,
    chainId: mezoTestnet.id,
    query: { enabled: Boolean(address) },
  });

  const rwa = mezoRwaTokens().filter((t) => t.address);
  const { data: tokenBalances } = useReadContracts({
    contracts: [
      {
        address: MUSD,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as Address],
        chainId: mezoTestnet.id,
      },
      ...rwa.map((t) => ({
        address: t.address as Address,
        abi: erc20Abi,
        functionName: "balanceOf" as const,
        args: [address as Address],
        chainId: mezoTestnet.id,
      })),
    ],
    query: { enabled: Boolean(address) },
  });

  const rows = useMemo(() => {
    if (!tokenBalances) return [];
    const musdBal =
      tokenBalances[0]?.status === "success"
        ? Number(formatUnits(tokenBalances[0].result as bigint, 18))
        : 0;
    const list: {
      id: string;
      symbol: string;
      name: string;
      bal: number;
      usd: number;
      logo?: string;
    }[] = [
      {
        id: "btc",
        symbol: "BTC",
        name: "Mezo Bitcoin · native gas",
        bal: btc ? Number(btc.formatted) : 0,
        usd: 0,
        logo: "/tokens/btc.png",
      },
      {
        id: "musd",
        symbol: "MUSD",
        name: "Mezo USD",
        bal: musdBal,
        usd: musdBal,
        logo: "/tokens/musd.png",
      },
    ];
    rwa.forEach((t, idx) => {
      const res = tokenBalances[idx + 1];
      const bal =
        res?.status === "success"
          ? Number(formatUnits(res.result as bigint, 18))
          : 0;
      if (bal <= 0) return;
      const price = collateralAssets.find((a) => a.id === t.id)?.priceUsd ?? 0;
      list.push({
        id: t.id,
        symbol: t.symbol,
        name: t.name,
        bal,
        usd: bal * price,
        logo: t.logo,
      });
    });
    return list;
  }, [btc, tokenBalances, rwa]);

  const walletUsd = rows.reduce((s, r) => s + r.usd, 0);
  const net = walletUsd + totals.collateralUsd - totals.debtMusd;

  if (!isConnected) {
    return (
      <>
        <PageHeader
          eyebrow="Overview"
          title="Your Pegforge book"
          description="Connect a wallet on Mezo testnet to see balances and open RWA loans."
          banner={pageArt.portfolio}
          bannerFocus={pageArtFocus.portfolio}
        />
        <EmptyState
          icon={<Wallet className="h-6 w-6" />}
          title="Connect wallet"
          body="Use the button in the header. Same wallet works across Desk, Positions, and Transact."
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Your Pegforge book"
        description={`${shortAddress(address)} · Mezo testnet`}
        banner={pageArt.portfolio}
        bannerFocus={pageArtFocus.portfolio}
        action={
          <Link href="/forge" className="btn-primary !py-2.5 text-[13px]">
            Open desk
          </Link>
        }
      />

      <FadeIn className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Wallet spot" value={formatUsd(walletUsd)} />
        <StatTile
          label="Collateral posted"
          value={formatUsd(totals.collateralUsd)}
          tone="pink"
        />
        <StatTile label="MUSD debt" value={formatUsd(totals.debtMusd)} />
        <StatTile
          label="Est. net"
          value={formatUsd(net)}
          tone={net >= 0 ? "good" : "warn"}
          hint={
            totals.count
              ? `${totals.count} open position${totals.count > 1 ? "s" : ""}`
              : "No loans yet"
          }
        />
      </FadeIn>

      <FadeIn delay={0.04}>
        <Surface className="overflow-hidden" pad="none">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="flex min-w-0 items-start gap-3.5">
              <TokenIcon
                src="/tokens/btc.png"
                alt="Mezo Bitcoin"
                size={48}
                className="shadow-sm ring-2 ring-white"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e6005c]">
                  Official Mezo Bitcoin
                </p>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-[#111]">
                  Native BTC gas on Mezo testnet
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#666]">
                  Pegforge pays fees in Mezo&apos;s native Bitcoin (chain 31611) -
                  same asset Mezo&apos;s BTC CDP uses. RWA loans are separate;
                  this BTC is for gas and the MUSD/BTC pool.
                </p>
                <p className="mt-2 font-mono text-[15px] font-semibold tabular-nums text-[#111]">
                  {btc
                    ? Number(btc.formatted).toLocaleString(undefined, {
                        maximumFractionDigits: 8,
                      })
                    : "-"}{" "}
                  <span className="text-[13px] font-medium text-[#888]">BTC</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <SoftLink href={MEZO_MUSD_BTC_POOL.faucetUrl} external>
                Claim testnet BTC
              </SoftLink>
              <SoftLink href={MEZO_MUSD_BTC_POOL.borrowUrl} external>
                Mezo BTC borrow
              </SoftLink>
              <SoftLink href={MEZO_MUSD_BTC_POOL.url} external>
                MUSD/BTC pool
              </SoftLink>
              <Link href="/transact" className="btn-secondary !py-2 text-[12px]">
                Send BTC
              </Link>
            </div>
          </div>
        </Surface>
      </FadeIn>

      <div className="split-book">
        <FadeIn delay={0.05} className="min-w-0">
          <Surface pad="none" className="overflow-hidden">
            <div className="split-row border-b border-[#f0f0ee] px-5 py-4 md:px-6">
              <div>
                <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
                  Balances
                </h2>
                <p className="text-[12px] text-[#888]">On Mezo testnet</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                <AddMusdButton className="!px-3 !py-1.5 !text-[11px]" />
                <Link href="/transact" className="btn-ghost">
                  Transact
                </Link>
              </div>
            </div>
            <ul className="divide-y divide-[#f3f3f1]">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 md:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <TokenIcon
                      src={r.logo || "/tokens/musd.png"}
                      alt={r.symbol}
                      size={40}
                    />
                    <div className="min-w-0">
                      <p className="font-medium tracking-[-0.02em]">{r.symbol}</p>
                      <p className="truncate text-[12px] text-[#888]">{r.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums tracking-[-0.02em]">
                      {r.bal < 0.0001 && r.bal > 0
                        ? r.bal.toExponential(2)
                        : r.bal.toLocaleString(undefined, {
                            maximumFractionDigits: 6,
                          })}
                    </p>
                    {r.usd > 0 ? (
                      <p className="text-[12px] text-[#888]">{formatUsd(r.usd)}</p>
                    ) : (
                      <p className="text-[12px] text-[#bbb]">gas asset</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Surface>
        </FadeIn>

        <FadeIn delay={0.08} className="split-rail min-w-0 space-y-4">
          <Surface>
            <div className="split-row">
              <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
                Open positions
              </h2>
              <Link
                href="/positions"
                className="text-[13px] font-medium text-[#e6005c] hover:underline"
              >
                Manage →
              </Link>
            </div>
            {positions.length === 0 ? (
              <p className="mt-4 text-[14px] leading-relaxed text-[#666]">
                Bridge RWA on the Desk, then borrow MUSD against it.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {positions.map((p) => (
                  <li
                    key={p.asset.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[1.05rem] bg-[#f7f7f5] px-3.5 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <TokenIcon src={p.asset.logo} alt={p.asset.ticker} />
                      <div className="min-w-0">
                        <p className="font-medium">{p.asset.ticker}</p>
                        <p className="text-[12px] text-[#777]">
                          {p.collateralUnits.toFixed(4)} posted
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[13px] font-semibold tabular-nums">
                        {p.debtMusd.toFixed(2)} MUSD
                      </p>
                      <HealthPill
                        ltv={p.ltvPercent}
                        max={p.asset.maxLtvPercent}
                        liq={p.asset.liqLtvPercent}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Surface>

          <div className="grid gap-2">
            <SoftLink href="/forge">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#e6005c]" /> Desk · bridge & borrow
              </span>
              <span className="text-[#bbb]">→</span>
            </SoftLink>
            <SoftLink href="/positions">
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-[#e6005c]" /> Positions · repay
              </span>
              <span className="text-[#bbb]">→</span>
            </SoftLink>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
