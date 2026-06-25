import { formatEther } from "viem";
import type { Address } from "viem";
import { getPublicClient, SEPOLIA_DONATION_POOL_ADDRESS } from "./client.js";
import { DONATION_POOL_ABI } from "./abi/donationPool.js";
import type { GasEstimate } from "./types.js";

export async function getGasEstimate(args: {
  amountWei: bigint;
  account: Address;
}): Promise<GasEstimate> {
  const publicClient = getPublicClient();

  const gasLimit = await publicClient.estimateContractGas({
    address: SEPOLIA_DONATION_POOL_ADDRESS,
    abi: DONATION_POOL_ABI,
    functionName: "donate",
    value: args.amountWei,
    account: args.account,
  });

  const { maxFeePerGas, maxPriorityFeePerGas } =
    await publicClient.estimateFeesPerGas();

  const safeMaxFeePerGas = maxFeePerGas ?? 0n;
  const safeMaxPriorityFeePerGas = maxPriorityFeePerGas ?? 0n;

  const estimatedCostWei = gasLimit * safeMaxFeePerGas;
  const estimatedCostWeiBuffered =
    (estimatedCostWei * 115n) / 100n;

  return {
    gasLimit,
    maxFeePerGas: safeMaxFeePerGas,
    maxPriorityFeePerGas: safeMaxPriorityFeePerGas,
    estimatedCostWei,
    estimatedCostWeiBuffered,
    estimatedCostEth: formatEther(estimatedCostWei),
  };
}
