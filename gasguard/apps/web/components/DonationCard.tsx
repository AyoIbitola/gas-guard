"use client";

import { useDonationFlow } from "@/hooks/useDonationFlow";
import { IdleView } from "./views/IdleView";
import { ReadyView } from "./views/ReadyView";
import { EstimatingView } from "./views/EstimatingView";
import { ConfirmView } from "./views/ConfirmView";
import { PreflightFailView } from "./views/PreflightFailView";
import { PendingView } from "./views/PendingView";
import { SuccessView } from "./views/SuccessView";
import { RevertedView } from "./views/RevertedView";
import { ParticleCanvas } from "./ui/ParticleCanvas";

export function DonationCard() {
  const {
    screen,
    amount,
    gasEstimate,
    error,
    txHash,
    donationAmount,
    address,
    balance,
    wrongNetwork,
    poolStats,
    handleAmountChange,
    handleDonate,
    handleReset,
  } = useDonationFlow();

  return (
    <>
      {screen === "idle" && <ParticleCanvas />}
      <div
        className="relative w-full"
        style={{
          background: "#0b0e14",
          border: "1px solid #292d30",
          borderRadius: 16,
          padding: 32,
          zIndex: 1,
        }}
      >
        {screen === "idle" && (
          <IdleView
            totalPooled={poolStats.totalPooled}
            minDonation={poolStats.minDonation}
          />
        )}
        {screen === "ready" && address && (
          <ReadyView
            amount={amount}
            onAmountChange={handleAmountChange}
            address={address}
            balance={balance}
            wrongNetwork={wrongNetwork}
          />
        )}
        {screen === "estimating" && address && (
          <EstimatingView
            amount={amount}
            onAmountChange={handleAmountChange}
            address={address}
            balance={balance}
            wrongNetwork={wrongNetwork}
          />
        )}
        {screen === "confirm" && address && gasEstimate && (
          <ConfirmView
            amount={amount}
            gasEstimate={gasEstimate}
            onAmountChange={handleAmountChange}
            onDonate={handleDonate}
            address={address}
            balance={balance}
            wrongNetwork={wrongNetwork}
          />
        )}
        {screen === "blocked" && address && error && (
          <PreflightFailView
            amount={amount}
            error={error}
            onAmountChange={handleAmountChange}
            address={address}
            balance={balance}
            wrongNetwork={wrongNetwork}
          />
        )}
        {screen === "pending" && txHash && <PendingView txHash={txHash} />}
        {screen === "success" && txHash && donationAmount !== null && (
          <SuccessView
            txHash={txHash}
            donationAmount={donationAmount}
            poolTotal={poolStats.totalPooled}
            onReset={handleReset}
          />
        )}
        {screen === "reverted" && txHash && donationAmount !== null && error && (
          <RevertedView
            txHash={txHash}
            donationAmount={donationAmount}
            error={error}
            onReset={handleReset}
          />
        )}
      </div>
    </>
  );
}
