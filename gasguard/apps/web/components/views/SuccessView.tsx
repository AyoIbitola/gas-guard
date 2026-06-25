import type { Hash } from "viem";
import { formatEth, etherscanTxUrl } from "@/lib/formatters";

interface SuccessViewProps {
  txHash: Hash;
  donationAmount: bigint;
  poolTotal: bigint | undefined;
  onReset: () => void;
}

export function SuccessView({ txHash, donationAmount, poolTotal, onReset }: SuccessViewProps) {
  return (
    <div className="animate-fade-up flex flex-col items-center gap-5 py-4">
      <div className="animate-bloom">
        <SuccessShield />
      </div>
      <div className="text-center">
        <h2 className="text-[32px] text-gg-text font-serif">
          Donation confirmed!
        </h2>
        <p className="text-[14px] text-gg-text-mid mt-1">
          You donated{" "}
          <span className="text-gg-text font-medium font-mono">
            {formatEth(donationAmount, 5)} ETH
          </span>
        </p>
      </div>
      {poolTotal !== undefined && (
        <div
          className="w-full rounded-xl p-4 text-center"
          style={{
            background: "rgba(58,211,137,0.07)",
            border: "1px solid rgba(58,211,137,0.32)",
          }}
        >
          <p className="text-[12px] text-gg-text-mid mb-1">Pool total</p>
          <p className="text-[18px] font-medium text-gg-green font-mono">
            {formatEth(poolTotal, 4)} ETH
          </p>
        </div>
      )}
      <a
        href={etherscanTxUrl(txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[13px] text-gg-acc hover:underline"
      >
        View on Etherscan ↗
      </a>
      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl text-[14px] font-medium"
        style={{
          background: "transparent",
          border: "1px solid #292d30",
          color: "#a1a4a5",
          cursor: "pointer",
        }}
      >
        Donate again
      </button>
    </div>
  );
}

function SuccessShield() {
  return (
    <svg
      width="80"
      height="92"
      viewBox="0 0 80 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 0 16px rgba(58,211,137,0.4))" }}
    >
      <path
        d="M40 2L78 16V42C78 65 62 82 40 90C18 82 2 65 2 42V16L40 2Z"
        fill="rgba(58,211,137,0.1)"
        stroke="rgba(58,211,137,0.5)"
        strokeWidth="1.5"
      />
      <path
        d="M26 46L36 56L54 36"
        stroke="#3ad389"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
