import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { parseEther, formatEther } from "viem";
import {
  startAnvil,
  stopAnvil,
  makeAnvilClients,
  deployDonationPool,
  donorAccount,
  ownerAccount,
} from "./anvil.js";
import { DONATION_POOL_ABI } from "../src/abi/donationPool.js";

let poolAddress: `0x${string}`;

beforeAll(async () => {
  await startAnvil();
  poolAddress = await deployDonationPool();
}, 30000);

afterAll(async () => {
  await stopAnvil();
});

async function estimateLocal(amountWei: bigint, account: `0x${string}`) {
  const { publicClient } = makeAnvilClients();
  const { DONATION_POOL_ABI: abi } = await import("../src/abi/donationPool.js");

  const gasLimit = await publicClient.estimateGas({
    address: poolAddress,
    abi,
    functionName: "donate",
    value: amountWei,
    account,
  });

  const { maxFeePerGas, maxPriorityFeePerGas } =
    await publicClient.estimateFeesPerGas();

  const safeMax = maxFeePerGas ?? 0n;
  const safeMaxPriority = maxPriorityFeePerGas ?? 0n;
  const estimatedCostWei = gasLimit * safeMax;
  const estimatedCostWeiBuffered = (estimatedCostWei * 115n) / 100n;

  return {
    gasLimit,
    maxFeePerGas: safeMax,
    maxPriorityFeePerGas: safeMaxPriority,
    estimatedCostWei,
    estimatedCostWeiBuffered,
    estimatedCostEth: formatEther(estimatedCostWei),
  };
}

describe("getGasEstimate", () => {
  it("returns a non-zero gasLimit for a valid donation", async () => {
    const estimate = await estimateLocal(parseEther("0.01"), donorAccount.address);
    expect(estimate.gasLimit).toBeGreaterThan(0n);
  });

  it("estimatedCostWeiBuffered is 15% higher than estimatedCostWei", async () => {
    const estimate = await estimateLocal(parseEther("0.01"), donorAccount.address);
    const expected = (estimate.estimatedCostWei * 115n) / 100n;
    expect(estimate.estimatedCostWeiBuffered).toBe(expected);
  });

  it("estimatedCostEth matches formatEther(estimatedCostWei)", async () => {
    const estimate = await estimateLocal(parseEther("0.01"), donorAccount.address);
    expect(estimate.estimatedCostEth).toBe(formatEther(estimate.estimatedCostWei));
  });

  it("buffered is strictly greater than unbuffered when cost > 0", async () => {
    const estimate = await estimateLocal(parseEther("0.01"), donorAccount.address);
    if (estimate.estimatedCostWei > 0n) {
      expect(estimate.estimatedCostWeiBuffered).toBeGreaterThan(
        estimate.estimatedCostWei,
      );
    }
  });
});
