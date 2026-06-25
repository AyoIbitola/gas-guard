"use client";

import dynamic from "next/dynamic";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmiConfig";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

// Inner providers rendered client-side only — prevents WalletConnect IndexedDB
// initialization from running during SSR and causing 30s+ delays.
function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

const ClientOnlyProviders = dynamic(() => Promise.resolve(WalletProviders), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ClientOnlyProviders>{children}</ClientOnlyProviders>;
}
