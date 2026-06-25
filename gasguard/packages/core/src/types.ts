export type DecodedError = {
  code: string;
  title: string;
  message: string;
  recoverable: boolean;
  raw: unknown;
};

export type GasEstimate = {
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedCostWei: bigint;
  estimatedCostWeiBuffered: bigint;
  estimatedCostEth: string;
};

export type PreflightResult =
  | { ok: true; gasEstimate: GasEstimate }
  | { ok: false; error: DecodedError };

export type ReceiptResult =
  | { status: "success"; receipt: unknown }
  | { status: "reverted"; error: DecodedError };
