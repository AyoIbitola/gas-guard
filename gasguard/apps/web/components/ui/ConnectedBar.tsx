"use client";

import { useDisconnect } from "wagmi";
import type { Address } from "viem";
import { truncateAddress, formatEth } from "@/lib/formatters";

interface ConnectedBarProps {
  address: Address;
  balance: bigint;
  wrongNetwork?: boolean;
}

export function ConnectedBar({ address, balance, wrongNetwork }: ConnectedBarProps) {
  const { disconnect } = useDisconnect();

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: "#3ad389", boxShadow: "0 0 4px #3ad389" }}
        />
        <span className="text-[13px] text-gg-text-mid font-mono">
          {truncateAddress(address)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-[11px] text-gg-text-mid hover:text-gg-red transition-colors"
          style={{ background: "none", border: "none", padding: "0 0 0 4px", cursor: "pointer" }}
        >
          disconnect
        </button>
      </div>

      {wrongNetwork ? (
        <span className="text-[12px] text-gg-amber">
          Wrong network — switch to Sepolia
        </span>
      ) : (
        <span className="text-[13px] text-gg-text-mid font-mono">
          {balance !== undefined ? `${formatEth(balance, 3)} ETH` : "—"}
        </span>
      )}
    </div>
  );
}
