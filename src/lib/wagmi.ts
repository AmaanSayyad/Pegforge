import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  baseSepolia,
  mezoMainnet,
  mezoTestnet,
  robinhoodTestnet,
  sepolia,
} from "./chains";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");
}

export const networks = [
  mezoTestnet,
  sepolia,
  baseSepolia,
  robinhoodTestnet,
  mezoMainnet,
] as [
  typeof mezoTestnet,
  typeof sepolia,
  typeof baseSepolia,
  typeof robinhoodTestnet,
  typeof mezoMainnet,
];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
