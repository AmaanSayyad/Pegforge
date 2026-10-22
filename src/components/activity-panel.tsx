"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Landmark,
  Link2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { explorerTxUrl, type ActivityItem, type ActivityKind } from "@/lib/activity";
import { collateralAssets, musdLogo, type CollateralAsset } from "@/lib/assets";
import { cn, shortAddress } from "@/lib/utils";
import { useActivity } from "@/hooks/use-activity";
import { pageArt, pageArtFocus } from "@/lib/mezo-media";
import { AddMusdButton } from "./add-musd-button";
import { TokenIcon, TokenPair } from "./token-icon";
import { EmptyState, FadeIn, PageHeader, Surface } from "./ui";

const PAGE_SIZE = 5;

const kindMeta: Record<ActivityKind, { label: string; tone: string }> = {
  borrow: { label: "Borrow", tone: "bg-[#fdeef1] text-[#e6005c]" },
  deposit: { label: "Deposit", tone: "bg-[#111] text-white" },
  repay: { label: "Repay", tone: "bg-[#fff4e5] text-[#9a5b00]" },
  withdraw: { label: "Withdraw", tone: "bg-[#f3eef8] text-[#6b4ea0]" },
  wrap: { label: "Wrap", tone: "bg-[#fdeef1] text-[#c4004a]" },
  send: { label: "Send", tone: "bg-[#fff0eb] text-[#c2410c]" },
  receive: { label: "Receive", tone: "bg-[#ecf3e5] text-[#2d5a32]" },
  mint: { label: "Mint", tone: "bg-[#f7f7f5] text-[#444]" },
  lock: { label: "Lock", tone: "bg-[#eef2ff] text-[#3730a3]" },
  approve: { label: "Approve", tone: "bg-[#f7f7f5] text-[#666]" },
  other: { label: "Other", tone: "bg-[#f7f7f5] text-[#666]" },
};

function resolveAsset(item: ActivityItem): CollateralAsset | null {
  if (item.assetId) {
    const byId = collateralAssets.find(
      (a) => a.id.toLowerCase() === item.assetId!.toLowerCase(),
    );
    if (byId) return byId;
  }
  const hay = `${item.title} ${item.detail ?? ""}`.toLowerCase();
  // Prefer longer tickers first so "xnvda" wins over partial noise
  const ranked = [...collateralAssets].sort(
    (a, b) => b.ticker.length - a.ticker.length,
  );
  return (
    ranked.find((a) => {
      const ticker = a.ticker.toLowerCase();
      const bare = ticker.replace(/^x/, "");
      return (
        hay.includes(ticker) ||
        hay.includes(`x${bare}`) ||
        hay.includes(a.id.toLowerCase()) ||
        hay.includes(a.name.toLowerCase())
      );
    }) ?? null
  );
}

type ActivityVisual =
  | { mode: "pair"; collateralSrc: string; collateralAlt: string }
  | { mode: "single"; src: string; alt: string };

/** Always token art — never Lucide sparkles / emoji-style marks. */
function activityVisual(item: ActivityItem): ActivityVisual {
  const asset = resolveAsset(item);
  const text = `${item.title} ${item.detail ?? ""}`;
  const mentionsMusd = /musd/i.test(text);
  const musdKinds: ActivityKind[] = ["borrow", "repay", "send", "receive", "mint"];
  const wantsMusd = mentionsMusd || musdKinds.includes(item.kind);

  if (asset && (item.kind === "borrow" || item.kind === "repay")) {
    return {
      mode: "pair",
      collateralSrc: asset.logo,
      collateralAlt: asset.ticker,
    };
  }

  if (asset && wantsMusd && mentionsMusd && item.kind !== "send") {
    return {
      mode: "pair",
      collateralSrc: asset.logo,
      collateralAlt: asset.ticker,
    };
  }

  if (asset) {
    return { mode: "single", src: asset.logo, alt: asset.ticker };
  }

  if (wantsMusd) {
    return { mode: "single", src: musdLogo, alt: "MUSD" };
  }

  // Last resort: still a real token mark, not an AI sparkle
  return { mode: "single", src: musdLogo, alt: "MUSD" };
}

function chainLabel(chainId?: number) {
  if (chainId === 31611) return "Mezo";
  if (chainId === 11155111) return "Sepolia";
  if (chainId === 84532) return "Base Sepolia";
  return null;
}

function relativeTime(at: number) {
  const sec = Math.max(0, Math.floor((Date.now() - at) / 1000));
  if (sec < 45) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)}d ago`;
  return new Date(at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function dayKey(at: number) {
  const d = new Date(at);
  const today = new Date();
  const yday = new Date();
  yday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupByDay(items: ActivityItem[]) {
  const map = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const key = dayKey(item.at);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return [...map.entries()];
}

export function ActivityPanel() {
  const { items, clear } = useActivity();
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  const pageItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  const groups = groupByDay(pageItems);
  const from = items.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(items.length, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="History"
        title="Activity"
        description="Every confirm from Desk and Transact lands here - with explorer links."
        banner={pageArt.activity}
        bannerFocus={pageArtFocus.activity}
        action={
          items.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                clear();
                setPage(0);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[12px] font-medium text-white ring-1 ring-white/25 transition hover:bg-white/20"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          ) : null
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-6 w-6" />}
          title="No activity yet"
          body="Borrow on the Desk or move funds in Transact. Confirmed steps show up here."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/forge" className="btn-primary !py-2.5 text-[13px]">
                Open Desk
              </Link>
              <Link href="/transact" className="btn-secondary !py-2.5 text-[13px]">
                Transact
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-[#888]">
              Showing{" "}
              <span className="font-semibold text-[#111]">
                {from}-{to}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#111]">{items.length}</span>
            </p>
            <AddMusdButton
              className="!px-3 !py-1.5 !text-[11px]"
              label="Add MUSD to MetaMask"
            />
          </div>

          <div className="space-y-8">
            {groups.map(([day, dayItems]) => (
              <section key={day}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#999]">
                    {day}
                  </h2>
                  <div className="h-px flex-1 bg-[#ebebe8]" />
                </div>
                <ul className="space-y-2.5">
                  {dayItems.map((item, i) => (
                    <ActivityRow key={item.id} item={item} index={i} />
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {pageCount > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#ebebe8]">
              <p className="text-[12px] text-[#888]">
                Page{" "}
                <span className="font-semibold text-[#111]">{page + 1}</span> of{" "}
                <span className="font-semibold text-[#111]">{pageCount}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f7f5] px-3.5 py-2 text-[12px] font-semibold text-[#111] transition hover:bg-[#fdeef1] hover:text-[#e6005c] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#f7f7f5] disabled:hover:text-[#111]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#111] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#e6005c] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#111]"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function ActivityRow({ item, index }: { item: ActivityItem; index: number }) {
  const meta = kindMeta[item.kind] ?? kindMeta.other;
  const visual = activityVisual(item);
  const url =
    item.hash && item.chainId
      ? explorerTxUrl(item.chainId, item.hash)
      : null;
  const chain = chainLabel(item.chainId);

  return (
    <FadeIn delay={Math.min(index * 0.03, 0.2)}>
      <Surface
        className="group overflow-hidden transition hover:border-[#e6005c]/25 hover:shadow-[0_16px_40px_-32px_rgba(17,17,17,0.45)]"
        pad="none"
      >
        <div className="flex gap-3.5 px-4 py-4 md:gap-4 md:px-5">
          <span className="mt-0.5 flex h-11 w-[3.35rem] shrink-0 items-center justify-start">
            {visual.mode === "pair" ? (
              <TokenPair
                collateralSrc={visual.collateralSrc}
                collateralAlt={visual.collateralAlt}
                size={42}
              />
            ) : (
              <TokenIcon
                src={visual.src}
                alt={visual.alt}
                size={42}
                className="shadow-[0_10px_22px_-14px_rgba(17,17,17,0.55)] ring-black/8"
              />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  meta.tone,
                )}
              >
                {meta.label}
              </span>
              {chain ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f7f5] px-2 py-0.5 text-[10px] font-medium text-[#888]">
                  <Link2 className="h-2.5 w-2.5" />
                  {chain}
                </span>
              ) : null}
              <span className="text-[11px] text-[#bbb]">
                {relativeTime(item.at)}
              </span>
            </div>

            <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em] text-[#111]">
              {item.title}
            </p>
            {item.detail ? (
              <p className="mt-0.5 text-[13px] text-[#666]">{item.detail}</p>
            ) : null}

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#999]">
              <span>{new Date(item.at).toLocaleString()}</span>
              {item.hash ? (
                <span className="font-mono">{shortAddress(item.hash)}</span>
              ) : null}
            </div>
          </div>

          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full bg-[#f7f7f5] px-3 text-[12px] font-medium text-[#111] transition group-hover:bg-[#fdeef1] group-hover:text-[#e6005c]"
            >
              Explorer
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="inline-flex h-9 shrink-0 items-center self-start rounded-full bg-[#f7f7f5] px-3 text-[12px] text-[#bbb]">
              <Landmark className="mr-1 h-3.5 w-3.5" />
              Local
            </span>
          )}
        </div>
      </Surface>
    </FadeIn>
  );
}
