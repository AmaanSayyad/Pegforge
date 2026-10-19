import type { Address, Hex } from "viem";
import { keccak256, stringToHex } from "viem";
import {
  baseSepolia,
  mezoTestnet,
  robinhoodTestnet,
  sepolia,
} from "./chains";
import type { CollateralAsset } from "./assets";

export type SourceProtocol = "ondo" | "xstocks" | "bstocks" | "robinhood";

export type AssetBridgeRoute = {
  assetId: string;
  protocol: SourceProtocol;
  protocolLabel: string;
  sourceChainId: number;
  sourceChainName: string;
  /** Source mock RWA (faucet) - set after deploy */
  sourceToken?: Address;
  /** SourceVault on that chain */
  sourceVault?: Address;
  /** Mezo wrapped MockRWA */
  mezoToken?: Address;
};

export function assetIdBytes(id: string): Hex {
  return keccak256(stringToHex(id));
}

/** Default routes: stocks on Eth/Base/Robinhood → wrap on Mezo testnet */
export const bridgeRoutes: Record<string, AssetBridgeRoute> = {
  nvda: {
    assetId: "nvda",
    protocol: "ondo",
    protocolLabel: "Ondo (NVDAon)",
    sourceChainId: sepolia.id,
    sourceChainName: "Ethereum Sepolia",
  },
  aapl: {
    assetId: "aapl",
    protocol: "xstocks",
    protocolLabel: "xStocks",
    sourceChainId: sepolia.id,
    sourceChainName: "Ethereum Sepolia",
  },
  msft: {
    assetId: "msft",
    protocol: "xstocks",
    protocolLabel: "xStocks",
    sourceChainId: baseSepolia.id,
    sourceChainName: "Base Sepolia",
  },
  amzn: {
    assetId: "amzn",
    protocol: "bstocks",
    protocolLabel: "bStocks",
    sourceChainId: baseSepolia.id,
    sourceChainName: "Base Sepolia",
  },
  googl: {
    assetId: "googl",
    protocol: "ondo",
    protocolLabel: "Ondo",
    sourceChainId: sepolia.id,
    sourceChainName: "Ethereum Sepolia",
  },
  meta: {
    assetId: "meta",
    protocol: "xstocks",
    protocolLabel: "xStocks",
    sourceChainId: sepolia.id,
    sourceChainName: "Ethereum Sepolia",
  },
  tsla: {
    assetId: "tsla",
    protocol: "robinhood",
    protocolLabel: "Robinhood (Sepolia mock)",
    // Robinhood testnet has no public faucet ETH for this wallet; Sepolia mock for demo.
    sourceChainId: sepolia.id,
    sourceChainName: "Ethereum Sepolia",
  },
  gold: {
    assetId: "gold",
    protocol: "ondo",
    protocolLabel: "Ondo / PAXG rail",
    sourceChainId: sepolia.id,
    sourceChainName: "Ethereum Sepolia",
  },
  silver: {
    assetId: "silver",
    protocol: "xstocks",
    protocolLabel: "xStocks metals",
    sourceChainId: baseSepolia.id,
    sourceChainName: "Base Sepolia",
  },
  wti: {
    assetId: "wti",
    protocol: "ondo",
    protocolLabel: "Ondo energy",
    sourceChainId: sepolia.id,
    sourceChainName: "Ethereum Sepolia",
  },
};

export function routeFor(asset: CollateralAsset): AssetBridgeRoute {
  return (
    bridgeRoutes[asset.id] ?? {
      assetId: asset.id,
      protocol: "ondo",
      protocolLabel: "Ondo",
      sourceChainId: sepolia.id,
      sourceChainName: "Ethereum Sepolia",
    }
  );
}

/**
 * Next.js only inlines NEXT_PUBLIC_* when the key is a static string.
 * Dynamic `process.env[\`NEXT_PUBLIC_…${id}\`]` is always undefined in the browser.
 */
const SOURCE_TOKENS: Record<string, Address | undefined> = {
  nvda: process.env.NEXT_PUBLIC_SOURCE_TOKEN_NVDA as Address | undefined,
  aapl: process.env.NEXT_PUBLIC_SOURCE_TOKEN_AAPL as Address | undefined,
  msft: process.env.NEXT_PUBLIC_SOURCE_TOKEN_MSFT as Address | undefined,
  amzn: process.env.NEXT_PUBLIC_SOURCE_TOKEN_AMZN as Address | undefined,
  googl: process.env.NEXT_PUBLIC_SOURCE_TOKEN_GOOGL as Address | undefined,
  meta: process.env.NEXT_PUBLIC_SOURCE_TOKEN_META as Address | undefined,
  tsla: process.env.NEXT_PUBLIC_SOURCE_TOKEN_TSLA as Address | undefined,
  gold: process.env.NEXT_PUBLIC_SOURCE_TOKEN_GOLD as Address | undefined,
  silver: process.env.NEXT_PUBLIC_SOURCE_TOKEN_SILVER as Address | undefined,
  wti: process.env.NEXT_PUBLIC_SOURCE_TOKEN_WTI as Address | undefined,
};

const MEZO_TOKENS: Record<string, Address | undefined> = {
  nvda: process.env.NEXT_PUBLIC_MEZO_TOKEN_NVDA as Address | undefined,
  aapl: process.env.NEXT_PUBLIC_MEZO_TOKEN_AAPL as Address | undefined,
  msft: process.env.NEXT_PUBLIC_MEZO_TOKEN_MSFT as Address | undefined,
  amzn: process.env.NEXT_PUBLIC_MEZO_TOKEN_AMZN as Address | undefined,
  googl: process.env.NEXT_PUBLIC_MEZO_TOKEN_GOOGL as Address | undefined,
  meta: process.env.NEXT_PUBLIC_MEZO_TOKEN_META as Address | undefined,
  tsla: process.env.NEXT_PUBLIC_MEZO_TOKEN_TSLA as Address | undefined,
  gold: process.env.NEXT_PUBLIC_MEZO_TOKEN_GOLD as Address | undefined,
  silver: process.env.NEXT_PUBLIC_MEZO_TOKEN_SILVER as Address | undefined,
  wti: process.env.NEXT_PUBLIC_MEZO_TOKEN_WTI as Address | undefined,
};

const SOURCE_VAULTS: Record<number, Address | undefined> = {
  11155111: process.env.NEXT_PUBLIC_SOURCE_VAULT_11155111 as Address | undefined,
  84532: process.env.NEXT_PUBLIC_SOURCE_VAULT_84532 as Address | undefined,
};

export function hydrateRoute(route: AssetBridgeRoute): AssetBridgeRoute {
  const id = route.assetId.toLowerCase();
  return {
    ...route,
    sourceToken: SOURCE_TOKENS[id] || route.sourceToken,
    sourceVault: SOURCE_VAULTS[route.sourceChainId] || route.sourceVault,
    mezoToken: MEZO_TOKENS[id] || route.mezoToken,
  };
}

export const PORTAL_ADDRESS = process.env
  .NEXT_PUBLIC_PEGORGE_PORTAL as Address | undefined;
export const MARKET_ADDRESS = process.env
  .NEXT_PUBLIC_RWA_MARKET as Address | undefined;

export const MEZO_DEST_CHAIN_ID = mezoTestnet.id;

export type SourceLockProof = {
  lockId: Hex;
  sourceToken: Address;
  amount: bigint;
  sourceChainId: number;
  sourceBlock: bigint;
  sourceTime: bigint;
};

export type BridgeStep =
  | "connect"
  | "source_mint"
  | "source_approve"
  | "source_lock"
  | "mezo_wrap"
  | "mezo_approve"
  | "deposit"
  | "borrow"
  | "done";

export const bridgeStepLabels: Record<BridgeStep, string> = {
  connect: "Connect wallet",
  source_mint: "Get source RWA",
  source_approve: "Approve vault",
  source_lock: "Lock on source chain",
  mezo_wrap: "Claim wrap + borrow on Mezo",
  mezo_approve: "Approve market",
  deposit: "Deposit collateral",
  borrow: "Borrow MUSD",
  done: "Done",
};
