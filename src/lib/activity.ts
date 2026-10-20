export type ActivityKind =
  | "mint"
  | "approve"
  | "lock"
  | "wrap"
  | "deposit"
  | "borrow"
  | "repay"
  | "withdraw"
  | "send"
  | "receive"
  | "other";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail?: string;
  hash?: string;
  chainId?: number;
  assetId?: string;
  amount?: string;
  at: number;
};

const KEY = "pegforge.activity.v1";
const MAX = 80;

export function loadActivity(): ActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActivityItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveActivity(items: ActivityItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
}

export function pushActivity(
  entry: Omit<ActivityItem, "id" | "at"> & { at?: number },
): ActivityItem {
  const item: ActivityItem = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: entry.at ?? Date.now(),
  };
  const next = [item, ...loadActivity()].slice(0, MAX);
  saveActivity(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pegforge:activity", { detail: item }));
  }
  return item;
}

export function explorerTxUrl(chainId: number | undefined, hash: string) {
  if (chainId === 31611) return `https://explorer.test.mezo.org/tx/${hash}`;
  if (chainId === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`;
  if (chainId === 84532) return `https://sepolia.basescan.org/tx/${hash}`;
  return null;
}
