import { formatEth } from "@/lib/formatters";

interface PoolStatsProps {
  totalPooled: bigint | undefined;
  minDonation: bigint | undefined;
}

export function PoolStats({ totalPooled, minDonation }: PoolStatsProps) {
  return (
    <div
      className="flex rounded-xl overflow-hidden"
      style={{ border: "1px solid #292d30" }}
    >
      <div className="flex-1 px-4 py-3">
        <div className="text-[11px] font-medium text-gg-muted mb-1 uppercase tracking-wider">
          Total Raised
        </div>
        <div className="text-[15px] text-gg-text font-mono">
          {totalPooled !== undefined ? `${formatEth(totalPooled, 4)} ETH` : "—"}
        </div>
      </div>
      <div className="w-px self-stretch" style={{ background: "#292d30" }} />
      <div className="flex-1 px-4 py-3">
        <div className="text-[11px] font-medium text-gg-muted mb-1 uppercase tracking-wider">
          Min Donation
        </div>
        <div className="text-[15px] text-gg-acc font-mono">
          {minDonation !== undefined ? `${formatEth(minDonation, 2)} ETH` : "—"}
        </div>
      </div>
    </div>
  );
}
