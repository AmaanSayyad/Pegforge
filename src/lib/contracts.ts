import type { Address } from "viem";
import { base, mainnet } from "viem/chains";
import { mezoMainnet, mezoTestnet } from "./chains";

export const MUSD_ADDRESS = {
  [mezoTestnet.id]: "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503" as Address,
  [mezoMainnet.id]: "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186" as Address,
  [mainnet.id]: "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186" as Address,
  [base.id]: "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186" as Address,
} as const;

export const AMUSD_ADDRESS =
  "0x52317a47585A6ACDfbD7a29B494c3E2baAE96aBc" as Address;

export const MEZO_MUSD_TESTNET = {
  BorrowerOperations: "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5" as Address,
  TroveManager: "0xE47c80e8c23f6B4A1aE41c34837a0599D5D16bb0" as Address,
  PriceFeed: "0x86bCF0841622a5dAC14A313a15f96A95421b9366" as Address,
  HintHelpers: "0x4e4cBA3779d56386ED43631b4dCD6d8EacEcBCF6" as Address,
  SortedTroves: "0x722E4D24FD6Ff8b0AC679450F3D91294607268fA" as Address,
  MUSD: MUSD_ADDRESS[mezoTestnet.id],
} as const;

export const RWA_MARKET_ADDRESS = {
  [mezoTestnet.id]: (process.env.NEXT_PUBLIC_RWA_MARKET || undefined) as
    | Address
    | undefined,
} as const;

export const PEGORGE_PORTAL_ADDRESS = (process.env.NEXT_PUBLIC_PEGORGE_PORTAL ||
  undefined) as Address | undefined;

export const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const sourceVaultAbi = [
  {
    type: "function",
    name: "lock",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "destChainId", type: "uint256" },
    ],
    outputs: [{ name: "lockId", type: "bytes32" }],
  },
  {
    type: "event",
    name: "Locked",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "lockId", type: "bytes32", indexed: true },
      { name: "destChainId", type: "uint256", indexed: false },
    ],
  },
] as const;

export const portalAbi = [
  {
    type: "function",
    name: "expressLoan",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assetId", type: "bytes32" },
      { name: "collateralAmount", type: "uint256" },
      { name: "musdAmount", type: "uint256" },
      { name: "sourceChainId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claimExpressLoan",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assetId", type: "bytes32" },
      { name: "sourceToken", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "musdAmount", type: "uint256" },
      { name: "sourceChainId", type: "uint256" },
      { name: "sourceBlock", type: "uint256" },
      { name: "sourceTime", type: "uint256" },
      { name: "lockId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claimWrap",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assetId", type: "bytes32" },
      { name: "sourceToken", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "sourceChainId", type: "uint256" },
      { name: "sourceBlock", type: "uint256" },
      { name: "sourceTime", type: "uint256" },
      { name: "lockId", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;

export const rwaMarketAbi = [
  {
    type: "function",
    name: "listAsset",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "priceUsd", type: "uint256" },
      { name: "maxLtvBps", type: "uint256" },
      { name: "liqThresholdBps", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "borrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "musdAmount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "repay",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "musdAmount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "maxBorrow",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "positions",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [
      { name: "collateral", type: "uint256" },
      { name: "debt", type: "uint256" },
    ],
  },
] as const;
