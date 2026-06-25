import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const artifactPath = join(
  __dirname,
  "../../../contracts/out/DonationPool.sol/DonationPool.json",
);

const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
  abi: unknown[];
};

const output = `export const DONATION_POOL_ABI = ${JSON.stringify(artifact.abi, null, 2)} as const;\n`;

const outPath = join(__dirname, "../src/abi/donationPool.ts");
writeFileSync(outPath, output, "utf8");

console.log(`ABI synced from artifact to ${outPath}`);
