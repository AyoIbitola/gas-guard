import { BaseError, ContractFunctionRevertedError, formatEther } from "viem";
import {
  UserRejectedRequestError,
  InsufficientFundsError,
  TransactionExecutionError,
} from "viem";
import type { DecodedError } from "./types.js";

export function decodeError(err: unknown): DecodedError {
  try {
    if (err instanceof BaseError) {
      const tier1 = decodeContractError(err);
      if (tier1) return { ...tier1, raw: err };

      const tier2 = decodeWalletError(err);
      if (tier2) return { ...tier2, raw: err };
    }

    return {
      code: "UNKNOWN_ERROR",
      title: "Something went wrong",
      message:
        "This transaction couldn't be completed. Technical details are available below if you'd like to investigate further.",
      recoverable: false,
      raw: err,
    };
  } catch {
    return {
      code: "UNKNOWN_ERROR",
      title: "Something went wrong",
      message:
        "This transaction couldn't be completed. Technical details are available below if you'd like to investigate further.",
      recoverable: false,
      raw: err,
    };
  }
}

function decodeContractError(
  err: BaseError,
): Omit<DecodedError, "raw"> | null {
  const revertedErr = err.walk(
    (e) => e instanceof ContractFunctionRevertedError,
  ) as ContractFunctionRevertedError | null;

  if (!revertedErr) return null;

  const errorName = revertedErr.data?.errorName;

  switch (errorName) {
    case "ContractIsPaused":
      return {
        code: "CONTRACT_PAUSED",
        title: "Donations paused",
        message:
          "This donation pool is currently paused by its owner. Donations aren't being accepted right now — try again later.",
        recoverable: false,
      };

    case "DonationBelowMinimum": {
      const args = revertedErr.data?.args as [bigint, bigint] | undefined;
      const sent = args?.[0] ?? 0n;
      const minimum = args?.[1] ?? 0n;
      return {
        code: "DONATION_BELOW_MINIMUM",
        title: "Amount too low",
        message: `You're sending ${formatEther(sent)} ETH, but the minimum donation is ${formatEther(minimum)} ETH.`,
        recoverable: true,
      };
    }

    case "NotOwner":
      return {
        code: "NOT_OWNER",
        title: "Owner-only action",
        message: "Only the contract owner can do this.",
        recoverable: false,
      };

    case "NoFundsToWithdraw":
      return {
        code: "NO_FUNDS_TO_WITHDRAW",
        title: "Nothing to withdraw",
        message: "There are currently no funds in the pool to withdraw.",
        recoverable: false,
      };

    case "WithdrawalTransferFailed":
      return {
        code: "WITHDRAWAL_TRANSFER_FAILED",
        title: "Withdrawal failed",
        message:
          "The withdrawal transaction failed when sending funds to the owner address. This is unusual — try again or check the owner address can receive ETH.",
        recoverable: true,
      };

    default:
      return null;
  }
}

function decodeWalletError(
  err: BaseError,
): Omit<DecodedError, "raw"> | null {
  if (err.walk((e) => e instanceof UserRejectedRequestError)) {
    return {
      code: "USER_REJECTED",
      title: "Transaction cancelled",
      message: "You declined the transaction in your wallet.",
      recoverable: true,
    };
  }

  if (err.walk((e) => e instanceof InsufficientFundsError)) {
    return {
      code: "INSUFFICIENT_FUNDS",
      title: "Insufficient balance",
      message:
        "Your wallet doesn't have enough ETH to cover this donation plus network gas fees.",
      recoverable: true,
    };
  }

  if (err.walk((e) => e instanceof TransactionExecutionError)) {
    return {
      code: "EXECUTION_ERROR",
      title: "Transaction couldn't be processed",
      message:
        "The network couldn't process this transaction. This is usually temporary — try again in a moment.",
      recoverable: true,
    };
  }

  return null;
}
