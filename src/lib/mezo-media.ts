/** Official Mezo brand graphics (mezo.org / Sanity CDN + crops).
 * Banners use full-bleed object-cover — pick landscape frames ≥1000px wide.
 * Prefer PNG for cutouts with alpha (e.g. earn-percent). Avoid tiny gfx-* crops.
 */

export const mezo = {
  logo: "/mezo/cdn/mezo-logo.svg",
  borrowBg: "/mezo/cdn/borrow-background.jpg",
  btcToken: "/mezo/cdn/btc-token.png",
  btcBento: "/mezo/cdn/btc-bento.png",
  // Keep PNG — JPEG re-encode flattened the alpha into a white box
  earnPercent: "/mezo/cdn/earn-percent.png",
  handMobile: "/mezo/cdn/hand-mobile.png",
  homeHero: "/mezo/cdn/home-hero-art.png",
  homeCard: "/mezo/cdn/home-card.png",
  homeArt1: "/mezo/cdn/home-art-1.webp",
  homeArt2: "/mezo/cdn/home-art-2.webp",
  homeArt3: "/mezo/cdn/home-art-3.banner.jpg",
  earnLock: "/mezo/cdn/earn-lock.banner.jpg",
  earnVote: "/mezo/cdn/earn-vote.png",
  earnVault: "/mezo/cdn/earn-vault.banner.jpg",
  earnPools: "/mezo/cdn/earn-pools.banner.jpg",
  // Padded to 1600×721 so object-cover keeps the full card border visible
  earnFeature: "/mezo/cdn/earn-feature.banner.jpg",
  featureHero: "/mezo/cdn/feature-hero.png",
  musdBg: "/mezo/cdn/musd-background.png",
  musdArt: "/mezo/cdn/musd-3.png",
  musdReady: "/mezo/cdn/musd-2.banner.jpg",
  musdProgress: "/mezo/cdn/musd-1.png",
  musdMintCard: "/mezo/cdn/musd-mint-card.banner.jpg",
  check: "/mezo/cdn/check-green.png",
  // mid-res landscape photos — good for cover banners
  heroFreedom: "/mezo/crops/hero-freedom.jpg",
  borrowDiscs: "/mezo/crops/borrow-discs.jpg",
  lifestyleVault: "/mezo/crops/lifestyle-vault.jpg",
  swapBento: "/mezo/crops/swap-bento.png",
  musdBento: "/mezo/crops/musd-bento.png",
  homeBento: "/mezo/crops/home-bento.jpg",
  featuresGrid: "/mezo/crops/features-grid.jpg",
  btcCoin: "/mezo/crops/btc-coin.png",
  percentCrop: "/mezo/crops/earn-percent.jpg",
} as const;

/**
 * App page banners — landscape art that fills with object-cover.
 * Prefer photographic / full-bleed frames over UI chrome cards.
 */
export const pageArt = {
  portfolio: mezo.earnFeature,
  activity: mezo.homeArt3,
  transact: mezo.musdReady,
  desk: mezo.earnVault,
  positions: mezo.earnLock,
  pools: mezo.earnPools,
} as const;

export const pageArtFocus: Record<keyof typeof pageArt, string> = {
  portfolio: "object-center",
  activity: "object-center",
  transact: "object-center",
  desk: "object-center",
  positions: "object-center",
  pools: "object-center",
};
