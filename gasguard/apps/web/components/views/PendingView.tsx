import type { Hash } from "viem";
import { etherscanTxUrl } from "@/lib/formatters";

interface PendingViewProps {
  txHash: Hash;
}

export function PendingView({ txHash }: PendingViewProps) {
  const shortHash = `${txHash.slice(0, 6)}…${txHash.slice(-4)}`;

  return (
    <div className="animate-fade-up flex flex-col items-center gap-5 py-4">
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: 80,
          height: 80,
          background: "rgba(59,158,255,0.07)",
          border: "1px solid rgba(59,158,255,0.2)",
        }}
      >
        <PendingShield />
      </div>
      <div className="text-center">
        <h2 className="text-[28px] text-gg-text font-serif">
          Transaction submitted
        </h2>
        <p className="text-[13px] text-gg-text-mid mt-1">
          Waiting for Ethereum to confirm your donation…
        </p>
      </div>
      <a
        href={etherscanTxUrl(txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[13px] text-gg-acc hover:underline"
      >
        <span className="font-mono">{shortHash}</span>
        <span>↗</span>
      </a>
    </div>
  );
}

function PendingShield() {
  return (
    <svg
      width="40"
      height="46"
      viewBox="0 0 40 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: "spin 3s linear infinite" }}
    >
      <path
        d="M20 1L39 8V21C39 33 31 42 20 45C9 42 1 33 1 21V8L20 1Z"
        fill="rgba(59,158,255,0.12)"
        stroke="#3b9eff"
        strokeWidth="1.5"
      />
      <path
        d="M20 13C20 13 15 19 15 23C15 26 17.2 28 20 28C22.8 28 25 26 25 23C25 19 20 13 20 13Z"
        fill="#3b9eff"
      />
    </svg>
  );
}
