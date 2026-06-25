import type { Address } from "viem";
import type { DecodedError } from "@gasguard/core";
import { AmountInput } from "@/components/ui/AmountInput";
import { ConnectedBar } from "@/components/ui/ConnectedBar";
import { DonateButton } from "@/components/ui/DonateButton";
import { ErrorCallout } from "@/components/ui/ErrorCallout";

interface PreflightFailViewProps {
  amount: string;
  error: DecodedError;
  onAmountChange: (v: string) => void;
  address: Address;
  balance: bigint;
  wrongNetwork?: boolean;
}

export function PreflightFailView({
  amount,
  error,
  onAmountChange,
  address,
  balance,
  wrongNetwork,
}: PreflightFailViewProps) {
  return (
    <div className="animate-fade-up flex flex-col gap-4">
      <ConnectedBar
        address={address}
        balance={balance}
        wrongNetwork={wrongNetwork}
      />
      <AmountInput value={amount} onChange={onAmountChange} />
      <ErrorCallout
        title={error.title}
        body={error.message}
        raw={error.raw}
        variant="amber"
      />
      <DonateButton onClick={() => {}} disabled={true} />
    </div>
  );
}
