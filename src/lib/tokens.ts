import type { Address } from "viem";
import { collateralAssets } from "./assets";
import { hydrateRoute, routeFor } from "./bridge";
import { mezoTestnet } from "./chains";
import { MUSD_ADDRESS } from "./contracts";

export type TokenRef = {
  id: string;
  symbol: string;
  name: string;
  address?: Address;
  chainId: number;
  decimals: number;
  logo?: string;
  kind: "native" | "musd" | "rwa" | "source";
};

export function mezoNative(): TokenRef {
  return {
    id: "btc",
    symbol: "BTC",
    name: "Mezo Bitcoin (native gas)",
    chainId: mezoTestnet.id,
    decimals: 18,
    logo: "/tokens/btc.png",
    kind: "native",
  };
}

export function mezoMusd(): TokenRef {
  return {
    id: "musd",
    symbol: "MUSD",
    name: "Mezo USD",
    address: MUSD_ADDRESS[mezoTestnet.id],
    chainId: mezoTestnet.id,
    decimals: 18,
    logo: "/tokens/musd.png",
    kind: "musd",
  };
}

export function mezoRwaTokens(): TokenRef[] {
  return collateralAssets.map((a) => {
    const route = hydrateRoute(routeFor(a));
    return {
      id: a.id,
      symbol: a.ticker,
      name: a.name,
      address: route.mezoToken,
      chainId: mezoTestnet.id,
      decimals: 18,
      logo: a.logo,
      kind: "rwa" as const,
    };
  });
}

export function sendableMezoTokens(): TokenRef[] {
  return [mezoNative(), mezoMusd(), ...mezoRwaTokens().filter((t) => t.address)];
}

/** Mezo testnet MUSD/BTC vAMM from Mezo Pools UI */
export const MEZO_MUSD_BTC_POOL = {
  address: "0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9" as Address,
  label: "vAMM-MUSD/BTC",
  url: "https://testnet.mezo.org/earn/pools/0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9",
  poolsUrl: "https://testnet.mezo.org/earn/pools",
  vaultsUrl: "https://testnet.mezo.org/earn/vaults",
  transactUrl: "https://testnet.mezo.org/transact",
  borrowUrl: "https://testnet.mezo.org/borrow",
  faucetUrl: "https://faucet.test.mezo.org/",
} as const;
