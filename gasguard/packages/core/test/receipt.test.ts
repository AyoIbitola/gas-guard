import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { parseEther, encodeFunctionData } from "viem";
import {
  startAnvil,
  stopAnvil,
  makeAnvilClients,
  deployDonationPool,
  donorAccount,
  ownerAccount,
} from "./anvil.js";
import { DONATION_POOL_ABI } from "../src/abi/donationPool.js";
import { decodeError } from "../src/errorDecoder.js";

let poolAddress: `0x${string}`;

beforeAll(async () => {
  await startAnvil();
  poolAddress = await deployDonationPool();
}, 30000);

afterAll(async () => {
  await stopAnvil();
});

afterEach(async () => {
  // Ensure the pool is always unpaused after each test, regardless of test outcome.
  const { publicClient, ownerWallet } = makeAnvilClients();
  const isPaused = await publicClient.readContract({
    address: poolAddress,
    abi: DONATION_POOL_ABI,
    functionName: "paused",
  });
  if (isPaused) {
    const hash = await ownerWallet.writeContract({
      address: poolAddress,
      abi: DONATION_POOL_ABI,
      functionName: "setPaused",
      args: [false],
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }
});

async function watchReceiptLocal(hash: `0x${string}`) {
  const { publicClient } = makeAnvilClients();

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === "success") {
    return { status: "success" as const, receipt };
  }

  const tx = await publicClient.getTransaction({ hash });

  try {
    await publicClient.simulateContract({
      address: poolAddress,
      abi: DONATION_POOL_ABI,
      functionName: "donate",
      value: tx.value,
      account: tx.from,
      blockNumber: receipt.blockNumber,
    });

    return {
      status: "reverted" as const,
      error: {
        code: "UNKNOWN_ERROR",
        title: "Transaction reverted",
        message: "The transaction was reverted on-chain.",
        recoverable: false,
        raw: receipt,
      },
    };
  } catch (replayErr) {
    return { status: "reverted" as const, error: decodeError(replayErr) };
  }
}

describe("watchDonationReceipt — revert replay", () => {
  it("recovers ContractIsPaused when a donation reverts because contract was paused", async () => {
    const { publicClient, ownerWallet, donorWallet } = makeAnvilClients();

    const pauseHash = await ownerWallet.writeContract({
      address: poolAddress,
      abi: DONATION_POOL_ABI,
      functionName: "setPaused",
      args: [true],
    });
    await publicClient.waitForTransactionReceipt({ hash: pauseHash });

    // Provide explicit gas so viem doesn't call estimateGas (which would fail on a paused contract)
    // and instead submits the transaction directly, allowing it to revert on-chain.
    const donateData = encodeFunctionData({
      abi: DONATION_POOL_ABI,
      functionName: "donate",
    });

    const donateHash = await donorWallet.sendTransaction({
      to: poolAddress,
      data: donateData,
      value: parseEther("0.01"),
      gas: 100000n,
    });

    const result = await watchReceiptLocal(donateHash);
    expect(result.status).toBe("reverted");
    if (result.status === "reverted") {
      expect(result.error.code).toBe("CONTRACT_PAUSED");
      expect(result.error.title).toBe("Donations paused");
    }
  });

  it("returns success for a successful donation", async () => {
    const { publicClient, donorWallet } = makeAnvilClients();

    const hash = await donorWallet.writeContract({
      address: poolAddress,
      abi: DONATION_POOL_ABI,
      functionName: "donate",
      value: parseEther("0.01"),
    });

    const result = await watchReceiptLocal(hash);
    expect(result.status).toBe("success");
  });
});

describe("race-condition end-to-end", () => {
  it("preflight passes, then contract is paused, then donation reverts with ContractIsPaused", async () => {
    const { publicClient, ownerWallet, donorWallet } = makeAnvilClients();

    // Step 1: Preflight — simulate and confirm it would succeed
    await publicClient.simulateContract({
      address: poolAddress,
      abi: DONATION_POOL_ABI,
      functionName: "donate",
      value: parseEther("0.01"),
      account: donorAccount,
    });
    // Preflight passed — no error thrown

    // Step 2: Owner pauses the contract BEFORE user submits
    const pauseHash = await ownerWallet.writeContract({
      address: poolAddress,
      abi: DONATION_POOL_ABI,
      functionName: "setPaused",
      args: [true],
    });
    await publicClient.waitForTransactionReceipt({ hash: pauseHash });

    // Step 3: User submits anyway — provide explicit gas to bypass estimateGas
    const donateData = encodeFunctionData({
      abi: DONATION_POOL_ABI,
      functionName: "donate",
    });

    const donateHash = await donorWallet.sendTransaction({
      to: poolAddress,
      data: donateData,
      value: parseEther("0.01"),
      gas: 100000n,
    });

    // Step 4: watchDonationReceipt correctly reports ContractIsPaused despite earlier preflight success
    const result = await watchReceiptLocal(donateHash);
    expect(result.status).toBe("reverted");
    if (result.status === "reverted") {
      expect(result.error.code).toBe("CONTRACT_PAUSED");
      expect(result.error.title).toBe("Donations paused");
    }
  });
});
