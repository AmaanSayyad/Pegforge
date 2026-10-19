import { defineChain } from "viem";
import { baseSepolia, sepolia } from "viem/chains";

/** Mezo Testnet - chainId 31611 */
export const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.test.mezo.org"],
      webSocket: ["wss://rpc-ws.test.mezo.org"],
    },
  },
  blockExplorers: {
    default: { name: "Mezo Explorer", url: "https://explorer.test.mezo.org" },
  },
  testnet: true,
});

/** Mezo Mainnet - chainId 31612 */
export const mezoMainnet = defineChain({
  id: 31612,
  name: "Mezo",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://mainnet.mezo.org",
        "https://mezo-mainnet.boar.network",
        "https://rpc_evm-mezo.imperator.co",
      ],
      webSocket: [
        "wss://mezo-mainnet.boar.network",
        "wss://ws_evm-mezo.imperator.co",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Mezo Explorer", url: "https://explorer.mezo.org" },
  },
});

/** Robinhood Chain testnet - tokenized stock rails */
export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.chain.robinhood.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Explorer",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  testnet: true,
});

export { sepolia, baseSepolia };

export const bridgeSourceChains = [
  sepolia,
  baseSepolia,
  robinhoodTestnet,
] as const;

export const supportedChains = [
  mezoTestnet,
  mezoMainnet,
  sepolia,
  baseSepolia,
  robinhoodTestnet,
] as const;

export type SupportedChainId = (typeof supportedChains)[number]["id"];
