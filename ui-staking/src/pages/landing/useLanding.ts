import { useReadContracts } from "wagmi";
import { stakingMasterChefAbi } from "../../blockchain/abi.ts";
import { erc20Abi } from "viem";
import { createArray } from "../../lib/array.ts";
import { isPoolActive, mapPoolData } from "../../helpers/pool.ts";
import { useBlockchainTime } from "../../hooks/useBlockchainTime.ts";

export function useLanding() {
  const timestamp = useBlockchainTime();

  const balanceAndPoolCount = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: erc20Abi,
        address: process.env.REACT_APP_MOR_ADDR as `0x${string}`,
        functionName: "balanceOf",
        args: [process.env.REACT_APP_STAKING_ADDR as `0x${string}`],
      },
      {
        abi: erc20Abi,
        address: process.env.REACT_APP_LMR_ADDR as `0x${string}`,
        functionName: "balanceOf",
        args: [process.env.REACT_APP_STAKING_ADDR as `0x${string}`],
      },
      {
        abi: stakingMasterChefAbi,
        address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
        functionName: "getPoolsCount",
        args: [],
      },
    ],
    query: {
      select(data) {
        const [availableRewardsMOR, tvlLMR, totalPools] = data;
        return {
          availableRewardsMOR,
          tvlLMR,
          totalPools,
        };
      },
    },
  });

  const activePoolsCount = useReadContracts({
    allowFailure: false,
    contracts: createArray(
      Number(balanceAndPoolCount.data?.totalPools),
      (i) =>
        ({
          abi: stakingMasterChefAbi,
          address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
          functionName: "pools",
          args: [i],
        } as const)
    ),
    query: {
      enabled: balanceAndPoolCount.isSuccess,
      select(data) {
        return data.reduce((acc, rawPool) => {
          const pool = mapPoolData(rawPool)!;

          if (!isPoolActive(pool, timestamp)) {
            return acc;
          }

          return acc + 1n;
        }, 0n);
      },
    },
  });

  return {
    balanceAndPoolCount,
    activePoolsCount,
  };
}
