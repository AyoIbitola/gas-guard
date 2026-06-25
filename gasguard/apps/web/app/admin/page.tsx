"use client";

import { useState } from "react";
import { useAccount, useReadContracts, useWalletClient } from "wagmi";
// useWalletClient is used inside PauseControl and WithdrawControl sub-components
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import type { Address } from "viem";
import {
  DONATION_POOL_ABI,
  SEPOLIA_DONATION_POOL_ADDRESS,
  decodeError,
} from "@gasguard/core";

const CONTRACT = SEPOLIA_DONATION_POOL_ADDRESS;

export default function AdminPage() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address: CONTRACT, abi: DONATION_POOL_ABI, functionName: "owner" },
      { address: CONTRACT, abi: DONATION_POOL_ABI, functionName: "paused" },
      { address: CONTRACT, abi: DONATION_POOL_ABI, functionName: "totalPooled" },
    ],
  });

  const owner = data?.[0]?.status === "success" ? (data[0].result as Address) : null;
  const paused = data?.[1]?.status === "success" ? (data[1].result as boolean) : null;
  const totalPooled = data?.[2]?.status === "success" ? (data[2].result as bigint) : null;

  const isOwner =
    !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  return (
    <div style={{ fontFamily: "monospace", maxWidth: 600, margin: "40px auto", padding: "0 20px" }}>
      <p style={{ color: "#888", fontSize: 13, borderLeft: "3px solid #444", paddingLeft: 10, marginBottom: 28 }}>
        This page is a testing tool for triggering owner-only contract states.
        It is not linked from the main app and is not part of the product.
      </p>

      <h1 style={{ fontSize: 20, marginBottom: 24 }}>GasGuard Admin</h1>

      <Section title="Wallet">
        {isConnected ? (
          <div>
            <Row label="Connected" value={address ?? "—"} />
            <ConnectButton />
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: 12, color: "#aaa" }}>No wallet connected.</p>
            <ConnectButton />
          </div>
        )}
      </Section>

      <Section title="Owner Check">
        {isLoading ? (
          <p style={{ color: "#888" }}>Loading…</p>
        ) : (
          <>
            <Row label="Contract owner" value={owner ?? "—"} />
            <Row label="Connected wallet" value={address ?? "—"} />
            <Row
              label="Match"
              value={
                !isConnected
                  ? "— (no wallet)"
                  : isOwner
                  ? "✅ Owner wallet connected"
                  : "❌ Not the owner — connect the deployer wallet"
              }
            />
          </>
        )}
      </Section>

      {isConnected && !isOwner && (
        <p style={{ color: "#f90", marginTop: 8 }}>
          Connect the owner wallet to use the controls below.
        </p>
      )}

      {isOwner && (
        <>
          <Section title="Contract State">
            <Row label="Paused" value={paused == null ? "—" : paused ? "true ⏸" : "false ▶"} />
            <Row
              label="Total pooled"
              value={totalPooled == null ? "—" : `${formatEther(totalPooled)} ETH`}
            />
            <button onClick={() => refetch()} style={btnStyle("#333")}>
              ↻ Refresh
            </button>
          </Section>

          <PauseControl
            paused={paused}
            address={address!}
            onDone={() => refetch()}
          />

          <WithdrawControl
            totalPooled={totalPooled}
            address={address!}
            onDone={() => refetch()}
          />
        </>
      )}
    </div>
  );
}

// ── Pause / Unpause ───────────────────────────────────────────────────────────

function PauseControl({
  paused,
  address,
  onDone,
}: {
  paused: boolean | null;
  address: Address;
  onDone: () => void;
}) {
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function toggle() {
    if (!walletClient || paused == null) return;
    setStatus("pending");
    setMsg("");
    try {
      const hash = await walletClient.writeContract({
        address: SEPOLIA_DONATION_POOL_ADDRESS,
        abi: DONATION_POOL_ABI,
        functionName: "setPaused",
        args: [!paused],
        account: address,
        chain: null,
      });
      setMsg(`tx: ${hash}`);
      setStatus("done");
      // Give the node a moment then refresh state
      setTimeout(onDone, 3000);
    } catch (err) {
      const decoded = decodeError(err);
      setMsg(`${decoded.title}: ${decoded.message}`);
      setStatus("error");
    }
  }

  const label = paused == null ? "…" : paused ? "Unpause contract" : "Pause contract";
  const color = paused ? "#3a3" : "#a33";

  return (
    <Section title="Pause / Unpause">
      <p style={{ color: "#aaa", fontSize: 13, marginBottom: 10 }}>
        Current: <strong>{paused == null ? "—" : paused ? "PAUSED ⏸" : "LIVE ▶"}</strong>
        {" · "}Clicking below will call <code>setPaused({String(!paused)})</code>.
      </p>
      <button
        onClick={toggle}
        disabled={status === "pending" || paused == null}
        style={btnStyle(color)}
      >
        {status === "pending" ? "Sending…" : label}
      </button>
      {msg && (
        <pre style={{ marginTop: 10, fontSize: 12, color: status === "error" ? "#f88" : "#8f8", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {msg}
        </pre>
      )}
    </Section>
  );
}

// ── Withdraw ─────────────────────────────────────────────────────────────────

function WithdrawControl({
  totalPooled,
  address,
  onDone,
}: {
  totalPooled: bigint | null;
  address: Address;
  onDone: () => void;
}) {
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const empty = totalPooled === 0n;

  async function withdraw() {
    if (!walletClient) return;
    setStatus("pending");
    setMsg("");
    try {
      const hash = await walletClient.writeContract({
        address: SEPOLIA_DONATION_POOL_ADDRESS,
        abi: DONATION_POOL_ABI,
        functionName: "withdraw",
        account: address,
        chain: null,
      });
      setMsg(`tx: ${hash}`);
      setStatus("done");
      setTimeout(onDone, 3000);
    } catch (err) {
      const decoded = decodeError(err);
      setMsg(`${decoded.title}: ${decoded.message}`);
      setStatus("error");
    }
  }

  return (
    <Section title="Withdraw">
      <p style={{ color: "#aaa", fontSize: 13, marginBottom: 10 }}>
        Pool balance:{" "}
        <strong>{totalPooled == null ? "—" : `${formatEther(totalPooled)} ETH`}</strong>
        {empty && " · Disabled because pool is empty (NoFundsToWithdraw would revert)."}
      </p>
      <button
        onClick={withdraw}
        disabled={status === "pending" || totalPooled == null || empty}
        style={btnStyle(empty ? "#444" : "#55a")}
        title={empty ? "Pool is empty — withdraw would revert with NoFundsToWithdraw" : ""}
      >
        {status === "pending" ? "Sending…" : "Withdraw all ETH to owner"}
      </button>
      {msg && (
        <pre style={{ marginTop: 10, fontSize: 12, color: status === "error" ? "#f88" : "#8f8", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {msg}
        </pre>
      )}
    </Section>
  );
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28, padding: "16px 20px", border: "1px solid #333", borderRadius: 8, background: "#0d0d0d" }}>
      <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "#666", marginBottom: 12 }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 6, fontSize: 13 }}>
      <span style={{ color: "#666", minWidth: 140 }}>{label}</span>
      <span style={{ color: "#ddd", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    marginTop: 4,
  };
}
