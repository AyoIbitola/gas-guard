interface AmountInputProps {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}

export function AmountInput({ value, onChange, readOnly }: AmountInputProps) {
  return (
    <div
      className="flex items-center rounded-xl px-4 py-3 gap-3"
      style={{
        background: "#111418",
        border: `1px solid ${readOnly ? "#292d30" : "rgba(59,158,255,0.45)"}`,
      }}
    >
      <input
        type="number"
        step="any"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder="0.00"
        className="flex-1 bg-transparent outline-none text-[22px] font-mono text-gg-text placeholder-gg-muted"
      />
      <span
        className="text-[13px] font-medium text-gg-muted px-2 py-0.5 rounded-md"
        style={{ background: "#0b0e14", border: "1px solid #292d30" }}
      >
        ETH
      </span>
    </div>
  );
}
