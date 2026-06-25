# GasGuard

A donation pool smart contract plus a chain-facing TypeScript library that provides preflight simulation, gas estimation, and structured error decoding before any transaction is signed.

## Repository structure

```
gasguard/
├── contracts/        # Foundry project — DonationPool.sol, tests, deploy script
├── packages/core/    # TypeScript library — public API for frontends
└── apps/web/         # Next.js 14 dApp — donation flow UI
```

## Contracts

### Prerequisites

- [Foundry](https://getfoundry.sh/) installed

### Setup

```bash
cp contracts/.env.example contracts/.env
# Fill in SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY
```

### Local tests

```bash
cd contracts
forge test -vvv
forge coverage --report summary
```

### Deploy to Sepolia

```bash
cd contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

After deployment, update `SEPOLIA_DONATION_POOL_ADDRESS` in `packages/core/src/client.ts`.

## TypeScript library (`packages/core`)

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10
- Anvil (installed with Foundry) — used for integration tests

### Setup

```bash
cd packages/core
cp .env.example .env
# Fill in SEPOLIA_RPC_URL for live-Sepolia calls
pnpm install
```

### Run tests (against a local Anvil fork — no live Sepolia needed)

```bash
pnpm test
```

### Run against live Sepolia (manual smoke test — not CI)

Set `SEPOLIA_RPC_URL` in `.env`, ensure `SEPOLIA_DONATION_POOL_ADDRESS` in `client.ts` points at the deployed contract, then import and call `preflightDonation` from a one-off script.

### Sync ABI after contract changes

```bash
cd packages/core
pnpm sync-abi
```

## Public API

```ts
import {
  preflightDonation,  // simulate + gas estimate in one call
  simulateOnly,       // simulation only (no gas estimate)
  decodeError,        // structured error decoder (export for frontend wallet errors too)
  watchDonationReceipt, // wait for tx receipt + replay reverted calls
  getPublicClient,
  SEPOLIA_DONATION_POOL_ADDRESS,
  DONATION_POOL_ABI,
} from "@gasguard/core";
```

## Frontend (`apps/web`)

### Prerequisites

- Node.js ≥ 22, pnpm ≥ 10

### Setup

```bash
cd apps/web
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SEPOLIA_RPC_URL (same key as contracts/.env SEPOLIA_RPC_URL)
# NEXT_PUBLIC_DONATION_POOL_ADDRESS is pre-filled with the deployed contract
```

### Run development server

```bash
pnpm --filter @gasguard/web dev
# App available at http://localhost:3000
```

### Run tests (13 hook unit tests — no browser needed)

```bash
pnpm --filter @gasguard/web test
```

### Production build

```bash
pnpm build   # builds packages/core first, then apps/web
```

### Testing the on-chain revert path (Milestone 6 procedure)

This is the manually-triggered test that exercises the `reverted` screen state.
The goal is to pause the contract in the window between a passing preflight and the
transaction confirming.

1. Open the app with MetaMask connected to Sepolia.
2. Enter a valid donation amount (e.g. 0.01 ETH). Wait for the gas estimate to appear.
3. **Without clicking Donate yet**, run in a separate terminal:
   ```bash
   source contracts/.env
   cast send 0x881e5F24E783481F00f2FD661D02BFc2C6c3b89A \
     "setPaused(bool)" true \
     --rpc-url $SEPOLIA_RPC_URL \
     --private-key $PRIVATE_KEY
   ```
4. Now click **Donate** in the app. MetaMask will prompt for signature.
5. Sign the transaction. It will be submitted and confirmed — but the contract is now
   paused, so it will revert on-chain.
6. The app transitions to the `reverted` state, showing "Transaction reverted" with a
   human-readable error ("The pool was paused…") and a raw error toggle.
7. After verifying, unpause the contract:
   ```bash
   cast send 0x881e5F24E783481F00f2FD661D02BFc2C6c3b89A \
     "setPaused(bool)" false \
     --rpc-url $SEPOLIA_RPC_URL \
     --private-key $PRIVATE_KEY
   ```

### Wallet library choice

RainbowKit 2.1.7 was chosen (over ConnectKit) and pinned to wagmi 2.12.0 because
wagmi 2.14+ requires viem features not present in the pinned viem 2.21.58 that
`packages/core` uses. Both must stay in sync if either is upgraded.

## Versions

- Foundry: 1.7.1
- viem: 2.21.58 (pinned — must match in packages/core and apps/web)
- wagmi: 2.12.0 (pinned — newer versions require viem > 2.21.58)
- RainbowKit: 2.1.7 (pinned)
- Solidity: ^0.8.24
- Node: 22
