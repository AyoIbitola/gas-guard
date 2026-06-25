import { DonationCard } from "@/components/DonationCard";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center px-5 pt-9 pb-32">
      <header className="w-full max-w-[460px] flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ShieldLogo />
          <span className="font-sans font-medium text-[15px] text-gg-text">
            GasGuard
          </span>
        </div>
        <NetworkBadge />
      </header>
      <main className="w-full max-w-[420px]">
        <DonationCard />
      </main>
    </div>
  );
}

function ShieldLogo() {
  return (
    <svg
      width="19"
      height="22"
      viewBox="0 0 19 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.5 0L19 4V10C19 15.5 14.8 20.7 9.5 22C4.2 20.7 0 15.5 0 10V4L9.5 0Z"
        fill="rgba(146,129,247,0.12)"
        stroke="#9281f7"
        strokeWidth="1.2"
      />
      <path
        d="M9.5 6C9.5 6 7 9 7 11C7 12.6 8.1 13.5 9.5 13.5C10.9 13.5 12 12.6 12 11C12 9 9.5 6 9.5 6Z"
        fill="#9281f7"
      />
    </svg>
  );
}

function NetworkBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gg-border">
      <svg
        width="10"
        height="16"
        viewBox="0 0 10 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 0L9.5 8L5 11L0.5 8L5 0Z" fill="#6c6c6c" />
        <path d="M5 12L9.5 9L5 16L0.5 9L5 12Z" fill="#6c6c6c" />
      </svg>
      <span className="text-[11px] font-medium text-gg-muted">Sepolia</span>
    </div>
  );
}
