"use client";

import { useState } from "react";

interface ErrorCalloutProps {
  title: string;
  body: string;
  raw?: unknown;
  variant: "amber" | "red";
}

const COLORS = {
  amber: {
    bg: "rgba(255,202,22,0.07)",
    border: "rgba(255,202,22,0.35)",
    icon: "#ffca16",
    title: "#ffca16",
    body: "#a1a4a5",
    toggle: "#ffca16",
  },
  red: {
    bg: "rgba(255,149,146,0.07)",
    border: "rgba(255,149,146,0.38)",
    icon: "#ff9592",
    title: "#ff9592",
    body: "#a1a4a5",
    toggle: "#ff9592",
  },
};

export function ErrorCallout({ title, body, raw, variant }: ErrorCalloutProps) {
  const [expanded, setExpanded] = useState(false);
  const c = COLORS[variant];

  const rawString = raw != null ? JSON.stringify(raw, null, 2) : undefined;

  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
          style={{
            background: `${c.icon}18`,
            color: c.icon,
            border: `1px solid ${c.border}`,
          }}
        >
          !
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-medium leading-snug"
            style={{ color: c.title }}
          >
            {title}
          </p>
          <p className="text-[12px] leading-relaxed mt-1 text-gg-text-mid">
            {body}
          </p>
        </div>
      </div>
      {rawString && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-medium underline mt-1"
            style={{ color: c.toggle }}
          >
            {expanded ? "Hide" : "Technical details"}
          </button>
          {expanded && (
            <pre
              className="mt-2 text-[11px] leading-relaxed p-3 rounded-lg overflow-x-auto break-all whitespace-pre-wrap text-gg-muted"
              style={{ background: "#0b0e14" }}
            >
              {rawString}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
