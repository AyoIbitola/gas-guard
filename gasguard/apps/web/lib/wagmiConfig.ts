"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "GasGuard",
  projectId: "gasguard-donation-pool",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      process.env["NEXT_PUBLIC_SEPOLIA_RPC_URL"] as string | undefined
    ),
  },
  ssr: true,
});
