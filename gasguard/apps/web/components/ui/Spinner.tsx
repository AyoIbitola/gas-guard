interface SpinnerProps {
  size?: number;
}

export function Spinner({ size = 14 }: SpinnerProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1.5px solid rgba(59,158,255,0.18)",
        borderTopColor: "#3b9eff",
        animation: "spin 0.8s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}
