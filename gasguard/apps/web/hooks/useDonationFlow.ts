"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useWalletClient, useChainId, useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";
import { parseEther, UserRejectedRequestError } from "viem";
import type { Hash, Address } from "viem";
import {
  preflightDonation,
  watchDonationReceipt,
  DONATION_POOL_ABI,
  SEPOLIA_DONATION_POOL_ADDRESS,
  type GasEstimate,
  type DecodedError,
} from "@gasguard/core";
import { useDebounce } from "./useDebounce";
import { usePoolStats } from "./usePoolStats";
import { SEPOLIA_CHAIN_ID } from "@/lib/constants";

export type Screen =
  | "idle"
  | "ready"
  | "estimating"
  | "confirm"
  | "blocked"
  | "pending"
  | "success"
  | "reverted";

export function useDonationFlow() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { data: balanceData } = useBalance({
    address,
    chainId: sepolia.id,
  });

  const balance = balanceData?.value ?? 0n;

  const [screen, setScreen] = useState<Screen>("idle");
  const [amount, setAmount] = useState("");
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [error, setError] = useState<DecodedError | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [donationAmount, setDonationAmount] = useState<bigint | null>(null);

  const poolStats = usePoolStats();
  const generationRef = useRef(0);

  const wrongNetwork = isConnected && chainId !== SEPOLIA_CHAIN_ID;

  // Watch wallet connection state
  useEffect(() => {
    if (isConnected && address) {
      if (screen === "idle") {
        setScreen("ready");
        setAmount("");
        setGasEstimate(null);
        setError(null);
        setTxHash(null);
        setDonationAmount(null);
      }
    } else {
      // Disconnected — reset everything
      setScreen("idle");
      setAmount("");
      setGasEstimate(null);
      setError(null);
      setTxHash(null);
      setDonationAmount(null);
    }
  }, [isConnected, address]); // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedAmount = useDebounce(amount, 600);

  // Preflight effect — fires when debounced amount settles
  useEffect(() => {
    if (!isConnected || !address) return;
    if (!debouncedAmount || parseFloat(debouncedAmount) <= 0) return;
    if (screen === "pending" || screen === "success" || screen === "reverted")
      return;

    const gen = ++generationRef.current;
    let cancelled = false;

    setScreen("estimating");
    setGasEstimate(null);
    setError(null);

    (async () => {
      try {
        const amountWei = parseEther(debouncedAmount as `${number}`);
        const result = await preflightDonation({
          amountWei,
          account: address as Address,
        });

        if (cancelled) return;

        if (result.ok) {
          setGasEstimate(result.gasEstimate);
          setScreen("confirm");
        } else {
          setError(result.error);
          setScreen("blocked");
        }
      } catch (err) {
        if (cancelled) return;
        setError({
          code: "NETWORK_ERROR",
          title: "Check failed",
          message: "Could not reach the network. Please try again.",
          recoverable: true,
          raw: err,
        });
        setScreen("blocked");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedAmount, isConnected, address]); // eslint-disable-line react-hooks/exhaustive-deps

  // 30-second gas refresh in confirm state
  useEffect(() => {
    if (screen !== "confirm" || !isConnected || !address || !amount) return;

    const intervalId = setInterval(async () => {
      if (parseFloat(amount) <= 0) return;
      try {
        const amountWei = parseEther(amount as `${number}`);
        const result = await preflightDonation({
          amountWei,
          account: address as Address,
        });
        if (result.ok) {
          setGasEstimate(result.gasEstimate);
        }
      } catch {
        // Silently ignore refresh failures — user still sees the last estimate
      }
    }, 30_000);

    return () => clearInterval(intervalId);
  }, [screen, isConnected, address, amount]);

  function handleAmountChange(val: string) {
    setAmount(val);
    if (!val || parseFloat(val) <= 0) {
      setScreen("ready");
      setGasEstimate(null);
      setError(null);
    } else {
      // Stay in ready; debounce will trigger the estimating transition
      if (screen !== "pending" && screen !== "success" && screen !== "reverted") {
        setScreen("ready");
      }
    }
  }

  async function handleDonate() {
    if (screen !== "confirm") return;
    if (!walletClient || !address || !gasEstimate) return;

    let amountWei: bigint;
    try {
      amountWei = parseEther(amount as `${number}`);
    } catch {
      return;
    }

    setDonationAmount(amountWei);

    try {
      const hash = await walletClient.writeContract({
        address: SEPOLIA_DONATION_POOL_ADDRESS,
        abi: DONATION_POOL_ABI,
        functionName: "donate",
        value: amountWei,
        account: address as Address,
        chain: null,
      });

      setTxHash(hash);
      setScreen("pending");

      const receiptResult = await watchDonationReceipt(hash);
      if (receiptResult.status === "success") {
        poolStats.refetch();
        setScreen("success");
      } else {
        setError(receiptResult.error);
        setScreen("reverted");
      }
    } catch (err) {
      // User rejected the wallet signature — return to confirm
      if (isUserRejection(err)) {
        setScreen("confirm");
        setDonationAmount(null);
        return;
      }
      // Other errors during receipt watching
      setError({
        code: "UNKNOWN_ERROR",
        title: "Transaction failed",
        message:
          "An unexpected error occurred. Check Etherscan for the latest status.",
        recoverable: true,
        raw: err,
      });
      setScreen("reverted");
    }
  }

  function handleReset() {
    setAmount("");
    setGasEstimate(null);
    setError(null);
    setTxHash(null);
    setDonationAmount(null);
    setScreen("ready");
  }

  return {
    screen,
    amount,
    gasEstimate,
    error,
    txHash,
    donationAmount,
    address: address as Address | undefined,
    balance,
    wrongNetwork,
    poolStats,
    handleAmountChange,
    handleDonate,
    handleReset,
  };
}

function isUserRejection(err: unknown): boolean {
  if (err instanceof UserRejectedRequestError) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (
      msg.includes("user rejected") ||
      msg.includes("user denied") ||
      msg.includes("rejected by user")
    ) {
      return true;
    }
  }
  return false;
}
