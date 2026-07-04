import { BrowserProvider } from "ethers";
import { createPublicClient, createWalletClient, custom, http, type Address } from "viem";
import { sepolia } from "viem/chains";
import { SEPOLIA_WRAPPER_PAIRS } from "./contracts";
import { createFheInstance } from "./fhe";

declare global {
  interface Window {
    ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }
}

export type TokenOpsRow = { address: Address; amount: bigint };

type FheValueInput = { value: boolean | bigint | Address; type: string };

type TokenOpsEncryptor = {
  encrypt: (params: { values: FheValueInput[]; contractAddress: Address; userAddress: Address }) => Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }>;
};

export function parseManifest(text: string): TokenOpsRow[] {
  return text.split("\n").map((row) => row.trim()).filter(Boolean).map((row) => {
    const [address, amount] = row.split(",").map((part) => part.trim());
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error(`Invalid recipient address: ${address}`);
    if (!amount || Number.isNaN(Number(amount))) throw new Error(`Invalid amount for ${address}`);
    return { address: address as Address, amount: BigInt(Math.floor(Number(amount) * 1_000_000)) };
  });
}

async function createRelayerEncryptor(): Promise<TokenOpsEncryptor> {
  const provider = new BrowserProvider(window.ethereum!);
  const relayer = await createFheInstance(provider);
  return {
    async encrypt({ values, contractAddress, userAddress }) {
      const input = relayer.createEncryptedInput(contractAddress, userAddress);
      for (const item of values) {
        if (item.type !== "euint64") throw new Error(`Unsupported TokenOps encryption type: ${item.type}`);
        input.add64(BigInt(item.value as bigint));
      }
      return input.encrypt();
    },
  };
}

export async function createTokenOpsDisperseClient(account: Address) {
  if (!window.ethereum) throw new Error("Connect a browser wallet first.");
  const rpc = import.meta.env.VITE_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const publicClient = createPublicClient({ chain: sepolia, transport: http(rpc) });
  const walletClient = createWalletClient({ account, chain: sepolia, transport: custom(window.ethereum) });
  const { createConfidentialDisperseClient } = await import("@tokenops/sdk/fhe-disperse");
  const encryptor = await createRelayerEncryptor();
  return createConfidentialDisperseClient({ publicClient, walletClient, encryptor });
}

export const TOKENOPS_DEFAULT_TOKEN = SEPOLIA_WRAPPER_PAIRS[0].wrapper;
