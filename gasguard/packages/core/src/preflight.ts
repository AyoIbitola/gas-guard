import type { Address } from "viem";
import { getPublicClient, SEPOLIA_DONATION_POOL_ADDRESS } from "./client.js";
import { DONATION_POOL_ABI } from "./abi/donationPool.js";
import { decodeError } from "./errorDecoder.js";
import { getGasEstimate } from "./gasEstimate.js";
import type { PreflightResult } from "./types.js";

export async function preflightDonation(args: {
  amountWei: bigint;
  account: Address;
}): Promise<PreflightResult> {
  const publicClient = getPublicClient();

  try {
    await publicClient.simulateContract({
      address: SEPOLIA_DONATION_POOL_ADDRESS,
      abi: DONATION_POOL_ABI,
      functionName: "donate",
      value: args.amountWei,
      account: args.account,
    });
  } catch (err) {
    return { ok: false, error: decodeError(err) };
  }

  try {
    const gasEstimate = await getGasEstimate(args);
    return { ok: true, gasEstimate };
  } catch (err) {
    return { ok: false, error: decodeError(err) };
  }
}

export async function simulateOnly(args: {
  amountWei: bigint;
  account: Address;
}): Promise<{ ok: true } | { ok: false; error: import("./types.js").DecodedError }> {
  const publicClient = getPublicClient();

  try {
    await publicClient.simulateContract({
      address: SEPOLIA_DONATION_POOL_ADDRESS,
      abi: DONATION_POOL_ABI,
      functionName: "donate",
      value: args.amountWei,
      account: args.account,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: decodeError(err) };
  }
}
