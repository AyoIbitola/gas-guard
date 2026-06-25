import type { Address } from "viem";
import { AmountInput } from "@/components/ui/AmountInput";
import { ConnectedBar } from "@/components/ui/ConnectedBar";
import { DonateButton } from "@/components/ui/DonateButton";

interface ReadyViewProps {
  amount: string;
  onAmountChange: (v: string) => void;
  address: Address;
  balance: bigint;
  wrongNetwork?: boolean;
}

export function ReadyView({
  amount,
  onAmountChange,
  address,
  balance,
  wrongNetwork,
}: ReadyViewProps) {
  return (
    <div className="animate-fade-up flex flex-col gap-4">
      <ConnectedBar
        address={address}
        balance={balance}
        wrongNetwork={wrongNetwork}
      />
      <div className="space-y-2">
        <AmountInput value={amount} onChange={onAmountChange} />
        <p className="text-[12px] text-gg-muted px-1">
          Gas cost shown before you confirm — no last-minute surprises.
        </p>
      </div>
      <DonateButton onClick={() => {}} disabled={true} />
    </div>
  );
}
