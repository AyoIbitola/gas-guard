import { formatEther } from "viem";
import type { Address, Hash } from "viem";

export function formatEth(wei: bigint, decimals: number): string {
  const eth = formatEther(wei);
  return Number(eth).toFixed(decimals);
}

export function formatEthShort(wei: bigint): string {
  return formatEth(wei, 4);
}

export function truncateAddress(addr: Address): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function etherscanTxUrl(hash: Hash): string {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}
