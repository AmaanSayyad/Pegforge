"use client";

import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { collateralAssets, type CollateralAsset } from "@/lib/assets";
import { hydrateRoute, routeFor } from "@/lib/bridge";
import { mezoTestnet } from "@/lib/chains";
import { rwaMarketAbi, RWA_MARKET_ADDRESS } from "@/lib/contracts";

const MARKET = RWA_MARKET_ADDRESS[mezoTestnet.id];

export type LivePosition = {
  asset: CollateralAsset;
  token?: `0x${string}`;
  collateral: bigint;
  debt: bigint;
  collateralUnits: number;
  debtMusd: number;
  collateralUsd: number;
  ltvPercent: number;
  maxBorrowMusd: number;
};

export function usePositions() {
  const { address, isConnected } = useAccount();

  const contracts = useMemo(() => {
    if (!address || !MARKET) return [];
    return collateralAssets.flatMap((asset) => {
      const token = hydrateRoute(routeFor(asset)).mezoToken;
      if (!token) return [];
      return [
        {
          address: MARKET,
          abi: rwaMarketAbi,
          functionName: "positions" as const,
          args: [address, token] as const,
          chainId: mezoTestnet.id,
        },
        {
          address: MARKET,
          abi: rwaMarketAbi,
          functionName: "maxBorrow" as const,
          args: [address, token] as const,
          chainId: mezoTestnet.id,
        },
      ];
    });
  }, [address]);

  const { data, isLoading, refetch, isFetching } = useReadContracts({
    contracts,
    query: { enabled: Boolean(address && MARKET && contracts.length) },
  });

  const positions: LivePosition[] = useMemo(() => {
    if (!data) return [];
    const out: LivePosition[] = [];
    let i = 0;
    for (const asset of collateralAssets) {
      const token = hydrateRoute(routeFor(asset)).mezoToken;
      if (!token) continue;
      const posRes = data[i++];
      const maxRes = data[i++];
      if (posRes?.status !== "success") continue;
      const [collateral, debt] = posRes.result as [bigint, bigint];
      if (collateral === 0n && debt === 0n) continue;
      const maxBorrow =
        maxRes?.status === "success" ? (maxRes.result as bigint) : 0n;
      const collateralUnits = Number(formatUnits(collateral, 18));
      const debtMusd = Number(formatUnits(debt, 18));
      const collateralUsd = collateralUnits * asset.priceUsd;
      const ltvPercent =
        collateralUsd > 0 ? (debtMusd / collateralUsd) * 100 : 0;
      out.push({
        asset,
        token,
        collateral,
        debt,
        collateralUnits,
        debtMusd,
        collateralUsd,
        ltvPercent,
        maxBorrowMusd: Number(formatUnits(maxBorrow, 18)),
      });
    }
    return out;
  }, [data]);

  const totals = useMemo(() => {
    const collateralUsd = positions.reduce((s, p) => s + p.collateralUsd, 0);
    const debtMusd = positions.reduce((s, p) => s + p.debtMusd, 0);
    return {
      collateralUsd,
      debtMusd,
      count: positions.length,
      healthLtv: collateralUsd > 0 ? (debtMusd / collateralUsd) * 100 : 0,
    };
  }, [positions]);

  return {
    positions,
    totals,
    isLoading: isLoading || isFetching,
    refetch,
    isConnected,
    marketReady: Boolean(MARKET),
  };
}
