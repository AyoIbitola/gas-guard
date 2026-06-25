import type { Hash } from "viem";
import type { DecodedError } from "@gasguard/core";
import { formatEth, etherscanTxUrl } from "@/lib/formatters";
import { ErrorCallout } from "@/components/ui/ErrorCallout";

interface RevertedViewProps {
  txHash: Hash;
  donationAmount: bigint;
  error: DecodedError;
  onReset: () => void;
}

export function RevertedView({ txHash, donationAmount, error, onReset }: RevertedViewProps) {
  const shortHash = `${txHash.slice(0, 6)}…${txHash.slice(-4)}`;

  return (
    <div className="animate-fade-up flex flex-col gap-4 py-2">
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            background: "rgba(255,149,146,0.07)",
            border: "1px solid rgba(255,149,146,0.38)",
          }}
        >
          <span className="text-[20px]" style={{ color: "#ff9592" }}>⚠</span>
        </div>
        <h2 className="text-[24px] text-gg-text font-serif">
          Transaction reverted
        </h2>
        <span className="text-[12px] text-gg-muted font-mono">{shortHash}</span>
      </div>

      <ErrorCallout
        title="Your ETH was not transferred"
        body={error.message}
        raw={error.raw}
        variant="red"
      />

      <div
        className="text-[12px] text-gg-muted p-3 rounded-lg"
        style={{ background: "#111418", border: "1px solid #292d30" }}
      >
        Gas was charged, but no donation was made.{" "}
        <span className="font-mono">{formatEth(donationAmount, 5)} ETH</span>{" "}
        remains in your wallet.
      </div>

      <div className="flex gap-3">
        <a
          href={etherscanTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 rounded-xl text-[14px] font-medium text-center"
          style={{
            background: "transparent",
            border: "1px solid #292d30",
            color: "#a1a4a5",
          }}
        >
          Etherscan ↗
        </a>
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-xl text-[14px] font-medium"
          style={{
            background: "transparent",
            border: "1px solid rgba(255,149,146,0.38)",
            color: "#ff9592",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
