import type { Address } from "viem";
import { parseEther } from "viem";
import type { GasEstimate } from "@gasguard/core";
import { AmountInput } from "@/components/ui/AmountInput";
import { ConnectedBar } from "@/components/ui/ConnectedBar";
import { DonateButton } from "@/components/ui/DonateButton";
import { GasBreakdown } from "@/components/ui/GasBreakdown";

interface ConfirmViewProps {
  amount: string;
  gasEstimate: GasEstimate;
  onAmountChange: (v: string) => void;
  onDonate: () => void;
  address: Address;
  balance: bigint;
  wrongNetwork?: boolean;
}

export function ConfirmView({
  amount,
  gasEstimate,
  onAmountChange,
  onDonate,
  address,
  balance,
  wrongNetwork,
}: ConfirmViewProps) {
  let donationWei: bigint;
  try {
    donationWei = parseEther(amount || "0");
  } catch {
    donationWei = 0n;
  }

  return (
    <div className="animate-fade-up flex flex-col gap-4">
      <ConnectedBar
        address={address}
        balance={balance}
        wrongNetwork={wrongNetwork}
      />
      <AmountInput value={amount} onChange={onAmountChange} />
      <GasBreakdown donation={donationWei} gasEstimate={gasEstimate} />
      <DonateButton onClick={onDonate} disabled={false} />
    </div>
  );
}
