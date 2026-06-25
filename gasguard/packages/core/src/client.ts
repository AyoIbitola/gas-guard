import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import type { Transport, WalletClient } from "viem";

export const SEPOLIA_DONATION_POOL_ADDRESS =
  "0x881e5F24E783481F00f2FD661D02BFc2C6c3b89A" as const;

export function getPublicClient() {
  // SEPOLIA_RPC_URL is available in Node.js (tests, scripts).
  // NEXT_PUBLIC_SEPOLIA_RPC_URL is the browser-side equivalent set by Next.js.
  // Without one of these, viem falls back to a public shared node (unreliable).
  const rpcUrl =
    process.env["SEPOLIA_RPC_URL"] ??
    process.env["NEXT_PUBLIC_SEPOLIA_RPC_URL"];
  return createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });
}

export function getWalletClient(transport: Transport): WalletClient {
  return createWalletClient({
    chain: sepolia,
    transport,
  });
}
