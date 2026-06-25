import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";

// ── Mocks (all hoisted, order matters) ─────────────────────────────────────

const mockAccount = {
  address: undefined as `0x${string}` | undefined,
  isConnected: false,
};
const mockWriteContract = vi.fn();
const mockWalletClient = { writeContract: mockWriteContract };
const mockRefetch = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => mockAccount,
  useChainId: () => 11155111,
  useWalletClient: () => ({ data: mockWalletClient }),
  useBalance: () => ({ data: { value: 1000000000000000000n } }),
  useReadContracts: () => ({
    data: [
      { status: "success", result: 5000000000000000n },
      { status: "success", result: 1000000000000000n },
    ],
    isLoading: false,
    refetch: mockRefetch,
  }),
}));

vi.mock("wagmi/chains", () => ({
  sepolia: { id: 11155111 },
}));

const mockPreflightDonation = vi.fn();
const mockWatchDonationReceipt = vi.fn();

vi.mock("@gasguard/core", () => ({
  preflightDonation: (...args: unknown[]) => mockPreflightDonation(...args),
  watchDonationReceipt: (...args: unknown[]) => mockWatchDonationReceipt(...args),
  DONATION_POOL_ABI: [],
  SEPOLIA_DONATION_POOL_ADDRESS: "0x881e5F24E783481F00f2FD661D02BFc2C6c3b89A",
}));

vi.mock("@/lib/constants", () => ({
  DONATION_POOL_ADDRESS: "0x881e5F24E783481F00f2FD661D02BFc2C6c3b89A",
  SUPPORTED_CHAIN: { id: 11155111 },
  SEPOLIA_CHAIN_ID: 11155111,
  MIN_DONATION_ETH: "0.001",
}));

vi.mock("viem", () => ({
  parseEther: (v: string) => BigInt(Math.round(parseFloat(v) * 1e18)),
  formatEther: (v: bigint) => (Number(v) / 1e18).toString(),
  UserRejectedRequestError: class UserRejectedRequestError extends Error {
    constructor() { super("User rejected"); }
  },
}));

// Make useDebounce return the value immediately (no 600ms wait)
vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: <T,>(value: T) => value,
}));

// ── Test helpers ────────────────────────────────────────────────────────────

function connectWallet(address = "0xabc123def456" as `0x${string}`) {
  mockAccount.address = address;
  mockAccount.isConnected = true;
}

function disconnectWallet() {
  mockAccount.address = undefined;
  mockAccount.isConnected = false;
}

const mockGasEstimate = {
  gasLimit: 21000n,
  maxFeePerGas: 1000000000n,
  maxPriorityFeePerGas: 100000000n,
  estimatedCostWei: 21000000000000n,
  estimatedCostWeiBuffered: 24150000000000n,
  estimatedCostEth: "0.000021",
};

const mockError = {
  code: "ContractIsPaused",
  title: "Pool is paused",
  message: "The pool is currently paused.",
  recoverable: false,
  raw: null,
};

// ── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  disconnectWallet();
  mockPreflightDonation.mockReset();
  mockWatchDonationReceipt.mockReset();
  mockWriteContract.mockReset();
  mockRefetch.mockReset();
});

// ── Import hook after mocks ─────────────────────────────────────────────────
// (dynamic import so mocks apply; vitest hoists vi.mock calls above imports)
async function getHook() {
  const { useDonationFlow } = await import("../hooks/useDonationFlow");
  return useDonationFlow;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("useDonationFlow", () => {
  it("starts in 'idle' state", async () => {
    const hook = await getHook();
    const { result } = renderHook(() => hook());
    expect(result.current.screen).toBe("idle");
  });

  it("transitions to 'ready' when wallet connects", async () => {
    const hook = await getHook();
    const { result, rerender } = renderHook(() => hook());
    expect(result.current.screen).toBe("idle");

    act(() => { connectWallet(); });
    rerender();

    await waitFor(() => expect(result.current.screen).toBe("ready"));
  });

  it("transitions to 'ready' on empty amount", async () => {
    const hook = await getHook();
    act(() => { connectWallet(); });

    const { result } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    // First give it a valid amount (which triggers estimating without debounce delay)
    mockPreflightDonation.mockReturnValue(new Promise(() => {}));
    act(() => { result.current.handleAmountChange("0.05"); });
    await waitFor(() => expect(result.current.screen).toBe("estimating"));

    // Clear it
    act(() => { result.current.handleAmountChange(""); });
    expect(result.current.screen).toBe("ready");
  });

  it("transitions to 'estimating' after debounce with valid amount", async () => {
    const hook = await getHook();
    act(() => { connectWallet(); });

    // Preflight never resolves — stays in estimating
    mockPreflightDonation.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    act(() => { result.current.handleAmountChange("0.05"); });

    await waitFor(() => expect(result.current.screen).toBe("estimating"));
  });

  it("transitions to 'confirm' on preflight success", async () => {
    const hook = await getHook();
    act(() => { connectWallet(); });
    mockPreflightDonation.mockResolvedValue({ ok: true, gasEstimate: mockGasEstimate });

    const { result } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    act(() => { result.current.handleAmountChange("0.05"); });

    await waitFor(() => expect(result.current.screen).toBe("confirm"));
    expect(result.current.gasEstimate).toEqual(mockGasEstimate);
  });

  it("transitions to 'blocked' on preflight failure", async () => {
    const hook = await getHook();
    act(() => { connectWallet(); });
    mockPreflightDonation.mockResolvedValue({ ok: false, error: mockError });

    const { result } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    act(() => { result.current.handleAmountChange("0.05"); });

    await waitFor(() => expect(result.current.screen).toBe("blocked"), { timeout: 3000 });
    expect(result.current.error).toEqual(mockError);
  });

  it("ignores stale preflight when amount changes mid-flight", async () => {
    const hook = await getHook();
    act(() => { connectWallet(); });

    let resolveFirst!: (v: unknown) => void;
    const firstPreflight = new Promise((res) => { resolveFirst = res; });
    const secondResult = { ok: false, error: mockError };

    mockPreflightDonation
      .mockReturnValueOnce(firstPreflight)
      .mockResolvedValueOnce(secondResult);

    const { result } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    // First amount — fires preflight (never resolves yet)
    act(() => { result.current.handleAmountChange("0.05"); });
    await waitFor(() => expect(result.current.screen).toBe("estimating"));

    // Change amount before first preflight resolves
    act(() => { result.current.handleAmountChange("0.0001"); });
    await waitFor(() => expect(result.current.screen).toBe("blocked"), { timeout: 3000 });

    // Now resolve the first (stale) preflight — screen should NOT flip to 'confirm'
    act(() => { resolveFirst({ ok: true, gasEstimate: mockGasEstimate }); });

    // Screen remains 'blocked' from the second result
    await waitFor(() => expect(result.current.screen).toBe("blocked"));
    expect(result.current.screen).not.toBe("confirm");
  });

  it("transitions to 'pending' on donate", async () => {
    const hook = await getHook();
    act(() => { connectWallet(); });
    const hash = "0xpending1234567890abc" as `0x${string}`;
    mockPreflightDonation.mockResolvedValue({ ok: true, gasEstimate: mockGasEstimate });
    // writeContract resolves with hash; watchDonationReceipt never resolves (stays pending)
    mockWriteContract.mockResolvedValue(hash);
    mockWatchDonationReceipt.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    act(() => { result.current.handleAmountChange("0.05"); });
    await waitFor(() => expect(result.current.screen).toBe("confirm"));

    await act(async () => { void result.current.handleDonate(); });

    await waitFor(() => expect(result.current.screen).toBe("pending"), { timeout: 3000 });
    expect(result.current.txHash).toBe(hash);
  });

  it("transitions to 'success' on receipt success", async () => {
    const hook = await getHook();
    act(() => { connectWallet(); });
    const hash = "0xabcdef1234567890abcdef" as `0x${string}`;
    mockPreflightDonation.mockResolvedValue({ ok: true, gasEstimate: mockGasEstimate });
    mockWriteContract.mockResolvedValue(hash);
    mockWatchDonationReceipt.mockResolvedValue({ status: "success" });

    const { result } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    act(() => { result.current.handleAmountChange("0.05"); });
    await waitFor(() => expect(result.current.screen).toBe("confirm"));

    await act(async () => { await result.current.handleDonate(); });

    await waitFor(() => expect(result.current.screen).toBe("success"), { timeout: 5000 });
    expect(result.current.txHash).toBe(hash);
  });

  it("transitions to 'reverted' on receipt revert", async () => {
    const hook = await getHook();
    act(() => { connectWallet(); });
    const hash = "0xdeadbeefcafe1234" as `0x${string}`;
    const revertError = { ...mockError, message: "The pool was paused in the brief window." };
    mockPreflightDonation.mockResolvedValue({ ok: true, gasEstimate: mockGasEstimate });
    mockWriteContract.mockResolvedValue(hash);
    mockWatchDonationReceipt.mockResolvedValue({ status: "reverted", error: revertError });

    const { result } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    act(() => { result.current.handleAmountChange("0.05"); });
    await waitFor(() => expect(result.current.screen).toBe("confirm"));

    await act(async () => { await result.current.handleDonate(); });

    await waitFor(() => expect(result.current.screen).toBe("reverted"), { timeout: 5000 });
    expect(result.current.error).toEqual(revertError);
  });

  it("returns to 'confirm' on user rejection", async () => {
    const { UserRejectedRequestError } = await import("viem");
    const hook = await getHook();
    act(() => { connectWallet(); });
    mockPreflightDonation.mockResolvedValue({ ok: true, gasEstimate: mockGasEstimate });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockWriteContract.mockRejectedValue(new (UserRejectedRequestError as any)());

    const { result } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    act(() => { result.current.handleAmountChange("0.05"); });
    await waitFor(() => expect(result.current.screen).toBe("confirm"));

    await act(async () => { await result.current.handleDonate(); });

    await waitFor(() => expect(result.current.screen).toBe("confirm"));
    expect(result.current.donationAmount).toBeNull();
  });

  it("resets to 'idle' on wallet disconnect", async () => {
    const hook = await getHook();
    act(() => { connectWallet(); });

    const { result, rerender } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    act(() => { disconnectWallet(); });
    rerender();

    await waitFor(() => expect(result.current.screen).toBe("idle"));
  });

  it("handleReset returns to 'ready'", async () => {
    const hook = await getHook();
    act(() => { connectWallet(); });
    mockPreflightDonation.mockResolvedValue({ ok: false, error: mockError });

    const { result } = renderHook(() => hook());
    await waitFor(() => expect(result.current.screen).toBe("ready"));

    act(() => { result.current.handleAmountChange("0.05"); });
    await waitFor(() => expect(result.current.screen).toBe("blocked"), { timeout: 3000 });

    act(() => { result.current.handleReset(); });

    expect(result.current.screen).toBe("ready");
    expect(result.current.amount).toBe("");
    expect(result.current.error).toBeNull();
    expect(result.current.gasEstimate).toBeNull();
    expect(result.current.txHash).toBeNull();
  });
});
