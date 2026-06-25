import { useReadContracts } from "wagmi";
import { DONATION_POOL_ADDRESS } from "@/lib/constants";
import { DONATION_POOL_ABI } from "@gasguard/core";

export function usePoolStats() {
  const result = useReadContracts({
    contracts: [
      {
        address: DONATION_POOL_ADDRESS,
        abi: DONATION_POOL_ABI,
        functionName: "totalPooled",
      },
      {
        address: DONATION_POOL_ADDRESS,
        abi: DONATION_POOL_ABI,
        functionName: "minDonation",
      },
    ],
    query: {
      refetchInterval: 12_000,
    },
  });

  const totalPooled =
    result.data?.[0]?.status === "success"
      ? (result.data[0].result as bigint)
      : undefined;

  const minDonation =
    result.data?.[1]?.status === "success"
      ? (result.data[1].result as bigint)
      : undefined;

  return {
    totalPooled,
    minDonation,
    isLoading: result.isLoading,
    refetch: result.refetch,
  };
}
