import { PoolStats } from "@/components/ui/PoolStats";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface IdleViewProps {
  totalPooled: bigint | undefined;
  minDonation: bigint | undefined;
}

export function IdleView({ totalPooled, minDonation }: IdleViewProps) {
  return (
    <div className="animate-fade-up flex flex-col gap-6 relative z-10">
      <div className="flex flex-col items-center gap-4 py-4">
        <HeroShield />
        <div className="text-center">
          <h1 className="text-[38px] text-gg-text leading-none font-serif">
            Support the pool
          </h1>
          <p className="text-[14px] text-gg-text-mid mt-2 max-w-[300px] leading-relaxed">
            Gas costs are estimated before you commit. No surprises, no
            confusing errors.
          </p>
        </div>
      </div>
      <PoolStats totalPooled={totalPooled} minDonation={minDonation} />
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button
            onClick={openConnectModal}
            className="w-full py-3 rounded-xl text-[15px] font-medium"
            style={{
              background: "transparent",
              border: "1px solid rgba(59,158,255,0.45)",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Connect Wallet
          </button>
        )}
      </ConnectButton.Custom>
    </div>
  );
}

function HeroShield() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 80, height: 92 }}
    >
      <svg
        width="80"
        height="92"
        viewBox="0 0 80 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 0 16px rgba(146,129,247,0.4))" }}
      >
        <path
          d="M40 2L78 16V42C78 65 62 82 40 90C18 82 2 65 2 42V16L40 2Z"
          fill="rgba(146,129,247,0.08)"
          stroke="rgba(146,129,247,0.42)"
          strokeWidth="1.5"
        />
        <path
          d="M40 26C40 26 30 38 30 46C30 52 34.5 56 40 56C45.5 56 50 52 50 46C50 38 40 26 40 26Z"
          fill="#9281f7"
        />
      </svg>
    </div>
  );
}
