import { useReadContracts } from "wagmi";
import { stakingMasterChefAbi } from "../../blockchain/abi.ts";
import { erc20Abi } from "viem";

export function useLanding() {
  return useReadContracts({
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
}
