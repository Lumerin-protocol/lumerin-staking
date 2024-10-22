import type { Chain } from "viem";

export function getTxURL(
  txhash: `0x${string}` | null | undefined,
  chain: Chain | undefined
): string | undefined {
  if (!chain?.blockExplorers) {
    return undefined;
  }
  return `${chain.blockExplorers?.default.url}/tx/${txhash}`;
}

export function getReadContractURL(
  address: `0x${string}` | null | undefined,
  chain: Chain | undefined,
  methodIndex: number
): string | undefined {
  if (!chain?.blockExplorers) {
    return undefined;
  }
  return `${chain.blockExplorers?.default.url}/address/${address}#readContract#F${methodIndex}`;
}
