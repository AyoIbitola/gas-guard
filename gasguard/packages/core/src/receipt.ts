import type { Hash } from "viem";
import { getPublicClient, SEPOLIA_DONATION_POOL_ADDRESS } from "./client.js";
import { DONATION_POOL_ABI } from "./abi/donationPool.js";
import { decodeError } from "./errorDecoder.js";
import type { ReceiptResult } from "./types.js";

export async function watchDonationReceipt(
  hash: Hash,
): Promise<ReceiptResult> {
  const publicClient = getPublicClient();

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === "success") {
    return { status: "success", receipt };
  }

  // Receipt reverted — replay the original donate() call at the failing block to recover
  // the structured custom error. We use simulateContract (not raw call) so viem decodes
  // the revert data against the ABI and produces a ContractFunctionRevertedError,
  // which our decoder's Tier 1 path handles exactly.
  const tx = await publicClient.getTransaction({ hash });

  try {
    await publicClient.simulateContract({
      address: SEPOLIA_DONATION_POOL_ADDRESS,
      abi: DONATION_POOL_ABI,
      functionName: "donate",
      value: tx.value,
      account: tx.from,
      blockNumber: receipt.blockNumber,
    });

    // If replay unexpectedly succeeds (state changed enough to not revert), report generic.
    return {
      status: "reverted",
      error: {
        code: "UNKNOWN_ERROR",
        title: "Transaction reverted",
        message:
          "The transaction was reverted on-chain. Technical details are available below.",
        recoverable: false,
        raw: receipt,
      },
    };
  } catch (replayErr) {
    return { status: "reverted", error: decodeError(replayErr) };
  }
}
