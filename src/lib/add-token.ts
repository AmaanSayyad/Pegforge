"use client";

import { getAddress, type Address } from "viem";
import { watchAsset } from "wagmi/actions";
import { mezoTestnet } from "@/lib/chains";
import { wagmiConfig } from "@/lib/wagmi";

function getInjectedProvider():
  | { request: (args: { method: string; params?: unknown }) => Promise<unknown> }
  | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    ethereum?: {
      providers?: Array<{
        isMetaMask?: boolean;
        request: (args: { method: string; params?: unknown }) => Promise<unknown>;
      }>;
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown }) => Promise<unknown>;
    };
  };
  const eth = w.ethereum;
  if (!eth) return undefined;
  // Prefer MetaMask when multiple injected wallets are present
  if (Array.isArray(eth.providers) && eth.providers.length) {
    return (
      eth.providers.find((p) => p.isMetaMask) ?? eth.providers[0] ?? eth
    );
  }
  return eth;
}

/** Ask the connected wallet to display a custom ERC-20. */
export async function addTokenToWallet(opts: {
  address: Address;
  symbol: string;
  decimals?: number;
  image?: string;
  chainId?: number;
}): Promise<{ ok: boolean; error?: string }> {
  const chainId = opts.chainId ?? mezoTestnet.id;
  const address = getAddress(opts.address);
  const symbol = opts.symbol.replace(/[^a-zA-Z0-9]/g, "").slice(0, 11) || "TOKEN";
  const decimals = opts.decimals ?? 18;
  // MetaMask rejects http://localhost images — only pass https URLs
  const image =
    opts.image && opts.image.startsWith("https://") ? opts.image : undefined;

  // 1) Preferred: wagmi connected connector (AppKit / WalletConnect)
  try {
    const ok = await watchAsset(wagmiConfig, {
      type: "ERC20",
      options: { address, symbol, decimals, image },
    });
    if (ok) return { ok: true };
  } catch (e) {
    // fall through to injected MetaMask
    console.warn("wagmi watchAsset failed, trying injected provider", e);
  }

  // 2) Fallback: window.ethereum / MetaMask directly
  const eth = getInjectedProvider();
  if (!eth?.request) {
    return {
      ok: false,
      error: "No wallet found. Open MetaMask and connect first.",
    };
  }

  try {
    // Ensure Mezo testnet is selected
    const hexId = `0x${chainId.toString(16)}`;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexId }],
      });
    } catch {
      // ignore — user may already be on the chain or reject switch
    }

    const wasAdded = await eth.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: { address, symbol, decimals, ...(image ? { image } : {}) },
      },
    });
    return { ok: Boolean(wasAdded) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Wallet rejected the request";
    return { ok: false, error: msg };
  }
}
