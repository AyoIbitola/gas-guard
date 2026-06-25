import type { GasEstimate } from "@gasguard/core";
import { formatEth } from "@/lib/formatters";
import { formatEther, parseEther } from "viem";

interface GasBreakdownProps {
  donation: bigint;
  gasEstimate: GasEstimate;
}

export function GasBreakdown({ donation, gasEstimate }: GasBreakdownProps) {
  const gasEth = Number(gasEstimate.estimatedCostEth).toFixed(6);
  const gasWei = parseEther(gasEth as `${number}`);
  const totalEth = Number(formatEther(donation + gasWei)).toFixed(6);

  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{ background: "#111418", border: "1px solid #292d30" }}
    >
      <Row label="Donation" value={`${formatEth(donation, 5)} ETH`} />
      <Row label="Estimated gas" value={`≈ ${gasEth} ETH`} muted />
      <div className="h-px my-2" style={{ background: "#292d30" }} />
      <Row label="Total" value={`${totalEth} ETH`} accent />
      <p className="text-[11px] text-gg-muted pt-1">
        Gas goes to Ethereum validators, not this pool.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  const textColor = accent ? "text-gg-acc" : muted ? "text-gg-muted" : "text-gg-text";
  return (
    <div className="flex justify-between items-center">
      <span className="text-[13px] text-gg-text-mid">{label}</span>
      <span className={`text-[13px] font-medium font-mono ${textColor}`}>{value}</span>
    </div>
  );
}
