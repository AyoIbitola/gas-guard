import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  ContractFunctionExecutionError,
} from "viem";
import { foundry } from "viem/chains";
import { decodeError } from "../src/errorDecoder.js";
import { DONATION_POOL_ABI } from "../src/abi/donationPool.js";
import {
  startAnvil,
  stopAnvil,
  makeAnvilClients,
  deployDonationPool,
  ANVIL_URL,
  MIN_DONATION,
  ownerAccount,
  donorAccount,
  nonOwnerAccount,
} from "./anvil.js";

let poolAddress: `0x${string}`;

beforeAll(async () => {
  await startAnvil();
  poolAddress = await deployDonationPool();
}, 30000);

afterAll(async () => {
  await stopAnvil();
});

describe("decodeError — never throws", () => {
  it("handles null", () => {
    const result = decodeError(null);
    expect(result.code).toBe("UNKNOWN_ERROR");
    expect(result.title).toBeTruthy();
    expect(result.message).toBeTruthy();
    expect(result.raw).toBeNull();
  });

  it("handles undefined", () => {
    const result = decodeError(undefined);
    expect(result.code).toBe("UNKNOWN_ERROR");
  });

  it("handles a plain string", () => {
    const result = decodeError("some error string");
    expect(result.code).toBe("UNKNOWN_ERROR");
    expect(result.raw).toBe("some error string");
  });

  it("handles an empty object", () => {
    const result = decodeError({});
    expect(result.code).toBe("UNKNOWN_ERROR");
  });

  it("handles a malformed object", () => {
    const result = decodeError({ walk: "not a function", cause: null });
    expect(result.code).toBe("UNKNOWN_ERROR");
  });

  it("always returns a valid DecodedError shape", () => {
    for (const input of [null, undefined, "string", 42, {}, [], new Error("test")]) {
      const result = decodeError(input);
      expect(typeof result.code).toBe("string");
      expect(typeof result.title).toBe("string");
      expect(typeof result.message).toBe("string");
      expect(typeof result.recoverable).toBe("boolean");
      expect("raw" in result).toBe(true);
    }
  });
});

describe("decodeError — Tier 1 contract custom errors", () => {
  it("decodes ContractIsPaused", async () => {
    const { publicClient, ownerWallet } = makeAnvilClients();

    // Pause the contract
    const pauseHash = await ownerWallet.writeContract({
      address: poolAddress,
      abi: DONATION_POOL_ABI,
      functionName: "setPaused",
      args: [true],
    });
    await publicClient.waitForTransactionReceipt({ hash: pauseHash });

    let caughtErr: unknown;
    try {
      await publicClient.simulateContract({
        address: poolAddress,
        abi: DONATION_POOL_ABI,
        functionName: "donate",
        value: parseEther("0.01"),
        account: donorAccount,
      });
    } catch (err) {
      caughtErr = err;
    }

    const decoded = decodeError(caughtErr);
    expect(decoded.code).toBe("CONTRACT_PAUSED");
    expect(decoded.title).toBe("Donations paused");
    expect(decoded.recoverable).toBe(false);

    // Unpause for subsequent tests
    const unpauseHash = await ownerWallet.writeContract({
      address: poolAddress,
      abi: DONATION_POOL_ABI,
      functionName: "setPaused",
      args: [false],
    });
    await publicClient.waitForTransactionReceipt({ hash: unpauseHash });
  });

  it("decodes DonationBelowMinimum with correct interpolated values", async () => {
    const { publicClient } = makeAnvilClients();
    const sentAmount = parseEther("0.0005");

    let caughtErr: unknown;
    try {
      await publicClient.simulateContract({
        address: poolAddress,
        abi: DONATION_POOL_ABI,
        functionName: "donate",
        value: sentAmount,
        account: donorAccount,
      });
    } catch (err) {
      caughtErr = err;
    }

    const decoded = decodeError(caughtErr);
    expect(decoded.code).toBe("DONATION_BELOW_MINIMUM");
    expect(decoded.title).toBe("Amount too low");
    expect(decoded.recoverable).toBe(true);
    expect(decoded.message).toContain("0.0005");
    expect(decoded.message).toContain("0.001");
  });

  it("decodes NotOwner", async () => {
    const { publicClient } = makeAnvilClients();

    let caughtErr: unknown;
    try {
      await publicClient.simulateContract({
        address: poolAddress,
        abi: DONATION_POOL_ABI,
        functionName: "withdraw",
        account: nonOwnerAccount,
      });
    } catch (err) {
      caughtErr = err;
    }

    const decoded = decodeError(caughtErr);
    expect(decoded.code).toBe("NOT_OWNER");
    expect(decoded.recoverable).toBe(false);
  });

  it("decodes NoFundsToWithdraw", async () => {
    const { publicClient } = makeAnvilClients();

    let caughtErr: unknown;
    try {
      await publicClient.simulateContract({
        address: poolAddress,
        abi: DONATION_POOL_ABI,
        functionName: "withdraw",
        account: ownerAccount,
      });
    } catch (err) {
      caughtErr = err;
    }

    const decoded = decodeError(caughtErr);
    expect(decoded.code).toBe("NO_FUNDS_TO_WITHDRAW");
    expect(decoded.recoverable).toBe(false);
  });
});
