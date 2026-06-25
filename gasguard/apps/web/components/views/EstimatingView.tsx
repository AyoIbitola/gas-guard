import type { Address } from "viem";
import { AmountInput } from "@/components/ui/AmountInput";
import { ConnectedBar } from "@/components/ui/ConnectedBar";
import { DonateButton } from "@/components/ui/DonateButton";
import { Spinner } from "@/components/ui/Spinner";

interface EstimatingViewProps {
  amount: string;
  onAmountChange: (v: string) => void;
  address: Address;
  balance: bigint;
  wrongNetwork?: boolean;
}

export function EstimatingView({
  amount,
  onAmountChange,
  address,
  balance,
  wrongNetwork,
}: EstimatingViewProps) {
  return (
    <div className="animate-fade-up flex flex-col gap-4">
      <ConnectedBar
        address={address}
        balance={balance}
        wrongNetwork={wrongNetwork}
      />
      <AmountInput value={amount} onChange={onAmountChange} />
      <div className="flex items-center gap-2 px-1">
        <Spinner size={14} />
        <span className="text-[13px] text-gg-muted">
          Checking validity and estimating gas…
        </span>
      </div>
      <DonateButton onClick={() => {}} disabled={true} />
    </div>
  );
}
