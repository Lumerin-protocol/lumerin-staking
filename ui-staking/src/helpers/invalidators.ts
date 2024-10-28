import type { Query, QueryKey } from "@tanstack/react-query";

interface WagmiQueryKey {
  functionName?: string;
  address?: `0x${string}`;
  args?: unknown[];
}

export function filterPoolQuery(poolId: bigint) {
  return (q: Query<unknown, Error, unknown, QueryKey>) => {
    const params = q.queryKey?.[1] as WagmiQueryKey;
    if (!params) {
      return false;
    }
    if (params?.functionName === "pools" && params?.args?.[0] === BigInt(poolId)) {
      return true;
    }
    return false;
  };
}

export function filterStakeQuery(poolId: bigint) {
  return (q: Query<unknown, Error, unknown, QueryKey>) => {
    const params = q.queryKey?.[1] as WagmiQueryKey;
    if (!params) {
      return false;
    }
    if (params?.functionName === "getStakes" && params?.args?.[1] === BigInt(poolId)) {
      return true;
    }
    return false;
  };
}

export function filterUserLMRBalanceQuery(address: `0x${string}`) {
  return (q: Query<unknown, Error, unknown, QueryKey>) => {
    const params = q.queryKey?.[1] as WagmiQueryKey;
    if (!params) {
      return false;
    }
    if (
      params?.functionName === "balanceOf" &&
      params?.address === process.env.REACT_APP_LMR_ADDR &&
      params?.args?.[0] === address
    ) {
      return true;
    }
    return false;
  };
}

export function filterUserMORBalanceQuery(address: `0x${string}`) {
  return (q: Query<unknown, Error, unknown, QueryKey>) => {
    const params = q.queryKey?.[1] as WagmiQueryKey;
    if (!params) {
      return false;
    }
    if (
      params?.functionName === "balanceOf" &&
      params?.address === process.env.REACT_APP_MOR_ADDR &&
      params?.args?.[0] === address
    ) {
      return true;
    }
    return false;
  };
}

export function filterUserETHBalanceQuery(address: `0x${string}`) {
  return (q: Query<unknown, Error, unknown, QueryKey>) => {
    const fnName = q.queryKey?.[0] as string;
    if (!fnName) {
      return false;
    }

    if (fnName === "balance") {
      const params = q.queryKey?.[1] as { address: `0x${string}`; chainId: number };
      if (params?.address === address) {
        return true;
      }
    }

    return false;
  };
}
