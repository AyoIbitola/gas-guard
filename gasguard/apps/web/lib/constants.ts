import { sepolia } from "wagmi/chains";

// Contract address deployed on Sepolia — must match SEPOLIA_DONATION_POOL_ADDRESS in packages/core/src/client.ts
export const DONATION_POOL_ADDRESS =
  "0x881e5F24E783481F00f2FD661D02BFc2C6c3b89A" as const;

export const SUPPORTED_CHAIN = sepolia;

export const SEPOLIA_CHAIN_ID = sepolia.id; // 11155111

// Human-readable display default; real min is always read from the contract
export const MIN_DONATION_ETH =
  process.env["NEXT_PUBLIC_MIN_DONATION_ETH"] ?? "0.001";
