export type AssetCategory = "equities" | "metals" | "energy";

export type CollateralAsset = {
  id: string;
  ticker: string;
  name: string;
  category: AssetCategory;
  unit: string;
  /** Spot / close price in USD (oracle mark) */
  priceUsd: number;
  maxLtvPercent: number;
  liqLtvPercent: number;
  blurb: string;
  realWorldHint: string;
  /** Local path under /public */
  logo: string;
  /** CoinGecko / source id for reference */
  source?: string;
};

export const categoryLabels: Record<AssetCategory, string> = {
  equities: "US stocks",
  metals: "Metals",
  energy: "Energy",
};

/** Oracle marks as of 2026-10-28 (Yahoo Finance close / spot). */
export const PRICE_AS_OF = "2026-10-28";

export const musdLogo = "/tokens/musd.png";
export const btcLogo = "/tokens/btc.png";

/** Demo allowlist - logos from CoinGecko xStocks / PAXG / KAG / BNOON / Mezo USD. */
export const collateralAssets: CollateralAsset[] = [
  {
    id: "nvda",
    ticker: "xNVDA",
    name: "NVIDIA",
    category: "equities",
    unit: "shares",
    priceUsd: 217.94,
    maxLtvPercent: 50,
    liqLtvPercent: 60,
    blurb: "Post tokenized NVIDIA. Borrow MUSD without selling AI exposure.",
    realWorldHint: "Maps to NVDAx / NVDAon tokenized NVDA.",
    logo: "/tokens/nvda.png",
    source: "nvidia-xstock",
  },
  {
    id: "aapl",
    ticker: "xAAPL",
    name: "Apple",
    category: "equities",
    unit: "shares",
    priceUsd: 347.1,
    maxLtvPercent: 50,
    liqLtvPercent: 60,
    blurb: "Mega-cap equity collateral for Bitcoin-backed dollars.",
    realWorldHint: "Tokenized AAPL rails on EVM / xStocks.",
    logo: "/tokens/aapl.png",
    source: "apple-xstock",
  },
  {
    id: "msft",
    ticker: "xMSFT",
    name: "Microsoft",
    category: "equities",
    unit: "shares",
    priceUsd: 531.33,
    maxLtvPercent: 50,
    liqLtvPercent: 60,
    blurb: "Blue-chip tech as MUSD collateral.",
    realWorldHint: "Tokenized MSFT / MSFTx.",
    logo: "/tokens/msft.png",
    source: "microsoft-xstock",
  },
  {
    id: "amzn",
    ticker: "xAMZN",
    name: "Amazon",
    category: "equities",
    unit: "shares",
    priceUsd: 253.1,
    maxLtvPercent: 45,
    liqLtvPercent: 55,
    blurb: "Keep AMZN upside, unlock MUSD liquidity.",
    realWorldHint: "Tokenized AMZN / AMZNx.",
    logo: "/tokens/amzn.png",
    source: "amazon-xstock",
  },
  {
    id: "googl",
    ticker: "xGOOGL",
    name: "Alphabet",
    category: "equities",
    unit: "shares",
    priceUsd: 320.58,
    maxLtvPercent: 45,
    liqLtvPercent: 55,
    blurb: "Google equity → spendable MUSD.",
    realWorldHint: "Tokenized GOOGL / GOOGx.",
    logo: "/tokens/googl.png",
    source: "alphabet-xstock",
  },
  {
    id: "meta",
    ticker: "xMETA",
    name: "Meta",
    category: "equities",
    unit: "shares",
    priceUsd: 620.19,
    maxLtvPercent: 45,
    liqLtvPercent: 55,
    blurb: "Social/AI equity collateral desk.",
    realWorldHint: "Tokenized META / METAx.",
    logo: "/tokens/meta.png",
    source: "meta-xstock",
  },
  {
    id: "tsla",
    ticker: "xTSLA",
    name: "Tesla",
    category: "equities",
    unit: "shares",
    priceUsd: 407.46,
    maxLtvPercent: 40,
    liqLtvPercent: 50,
    blurb: "Higher vol → stricter LTV on pegforge.fun.",
    realWorldHint: "Tokenized TSLA / TSLAx.",
    logo: "/tokens/tsla.png",
    source: "tesla-xstock",
  },
  {
    id: "gold",
    ticker: "xGOLD",
    name: "Gold",
    category: "metals",
    unit: "oz",
    priceUsd: 4054.38,
    maxLtvPercent: 65,
    liqLtvPercent: 75,
    blurb: "Tokenized gold ounces as collateral for MUSD.",
    realWorldHint: "Maps to PAXG / XAUT-style gold.",
    logo: "/tokens/gold.png",
    source: "pax-gold",
  },
  {
    id: "silver",
    ticker: "xSILVER",
    name: "Silver",
    category: "metals",
    unit: "oz",
    priceUsd: 54.11,
    maxLtvPercent: 55,
    liqLtvPercent: 65,
    blurb: "Silver exposure without selling metal to get dollars.",
    realWorldHint: "Maps to KAG / tokenized XAG.",
    logo: "/tokens/silver.png",
    source: "kinesis-silver",
  },
  {
    id: "wti",
    ticker: "xWTI",
    name: "Crude oil (WTI)",
    category: "energy",
    unit: "barrels",
    priceUsd: 101.64,
    maxLtvPercent: 40,
    liqLtvPercent: 50,
    blurb: "Commodity collateral - oil exposure → borrow MUSD.",
    realWorldHint: "Maps to tokenized oil / BNOON-style funds.",
    logo: "/tokens/wti.png",
    source: "us-brent-oil-fund-ondo-tokenized",
  },
];

export type BorrowPlanInput = {
  units: number;
  priceUsd: number;
  maxLtvPercent: number;
  liqLtvPercent: number;
  borrowMusd: number;
};

export type BorrowPlan = {
  ok: boolean;
  reason?: string;
  collateralUsd: number;
  maxBorrow: number;
  ltvPercent: number;
  liquidationPrice: number;
};

export function simulateBorrow(input: BorrowPlanInput): BorrowPlan {
  const { units, priceUsd, maxLtvPercent, liqLtvPercent, borrowMusd } = input;
  if (units <= 0) return fail("Enter how much collateral to post.");
  if (priceUsd <= 0) return fail("Invalid oracle price.");

  const collateralUsd = units * priceUsd;
  const maxBorrow = collateralUsd * (maxLtvPercent / 100);
  const ltvPercent = collateralUsd === 0 ? 0 : (borrowMusd / collateralUsd) * 100;
  const liqFrac = liqLtvPercent / 100;
  const liquidationPrice =
    borrowMusd <= 0 || units <= 0 ? 0 : borrowMusd / (units * liqFrac);

  if (borrowMusd > maxBorrow + 1e-6) {
    return {
      ok: false,
      reason: `Over LTV. Max borrow ≈ $${maxBorrow.toFixed(2)} MUSD at ${maxLtvPercent}% LTV.`,
      collateralUsd,
      maxBorrow,
      ltvPercent,
      liquidationPrice,
    };
  }

  return { ok: true, collateralUsd, maxBorrow, ltvPercent, liquidationPrice };
}

function fail(reason: string): BorrowPlan {
  return {
    ok: false,
    reason,
    collateralUsd: 0,
    maxBorrow: 0,
    ltvPercent: 0,
    liquidationPrice: 0,
  };
}

export function assetsByCategory(category: AssetCategory) {
  return collateralAssets.filter((a) => a.category === category);
}

/**
 * Keep this much MUSD in the desk so Max / heavy borrows can't drain the pool dry
 * for the next demo user.
 */
export const DESK_LIQUIDITY_RESERVE = 100;

/**
 * Default Express borrow — small enough that every listed asset can demo
 * without emptying shared MUSD liquidity (~10–20 borrows per 1–2k seed).
 */
export const DEMO_DEFAULT_BORROW_MUSD = 25;

/** Sensible demo size for an asset (~$1k-$3k collateral). */
export function defaultUnitsFor(asset: CollateralAsset): number {
  if (asset.id === "gold") return 1;
  if (asset.id === "silver") return 25;
  if (asset.category === "energy") return 20;
  if (asset.priceUsd >= 500) return 3;
  if (asset.priceUsd >= 300) return 5;
  return 8;
}

/** LTV headroom for this position (no liquidity cap). */
export function ltvBorrowCap(asset: CollateralAsset, units: number): number {
  return Math.floor(
    units * asset.priceUsd * (asset.maxLtvPercent / 100),
  );
}

/**
 * Usable desk MUSD after keeping a reserve for other users.
 */
export function usableDeskLiquidity(deskLiquidity: number | undefined): number {
  if (deskLiquidity === undefined || !Number.isFinite(deskLiquidity)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, Math.floor(deskLiquidity - DESK_LIQUIDITY_RESERVE));
}

/**
 * Default borrow: demo minimum, never above LTV or usable desk liquidity.
 */
export function defaultBorrowFor(
  asset: CollateralAsset,
  units: number,
  deskLiquidity?: number,
): number {
  const ltvMax = ltvBorrowCap(asset, units);
  const soft = Math.min(
    DEMO_DEFAULT_BORROW_MUSD,
    Math.floor(ltvMax * 0.7),
  );
  const liquid = usableDeskLiquidity(deskLiquidity);
  return Math.max(0, Math.min(soft, ltvMax, liquid));
}

/** Max the UI will allow: LTV ∩ usable desk liquidity. */
export function cappedMaxBorrow(
  asset: CollateralAsset,
  units: number,
  deskLiquidity?: number,
): number {
  const ltvMax = ltvBorrowCap(asset, units);
  const liquid = usableDeskLiquidity(deskLiquidity);
  return Math.max(0, Math.min(ltvMax, liquid));
}
