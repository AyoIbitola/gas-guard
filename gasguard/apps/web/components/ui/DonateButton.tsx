interface DonateButtonProps {
  onClick: () => void;
  disabled: boolean;
  label?: string;
}

export function DonateButton({
  onClick,
  disabled,
  label = "Donate",
}: DonateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 rounded-xl text-[15px] font-medium transition-colors"
      style={
        disabled
          ? {
              background: "transparent",
              border: "1px solid #292d30",
              color: "#6c6c6c",
              cursor: "not-allowed",
            }
          : {
              background: "transparent",
              border: "1px solid rgba(59,158,255,0.45)",
              color: "#ffffff",
              cursor: "pointer",
            }
      }
    >
      {label}
    </button>
  );
}
