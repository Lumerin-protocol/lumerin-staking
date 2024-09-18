import { useReadContracts } from "wagmi";
import { stakingMasterChefAbi } from "../../blockchain/abi.ts";
import { erc20Abi } from "viem";

export function useLanding() {
  const batchCall = useReadContracts({
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
  });

  const availableRewardsMOR =
    batchCall.isSuccess && batchCall.data[0].status === "success"
      ? ({
          data: batchCall.data?.[0]?.result,
          isSuccess: true,
          error: undefined,
        } as const)
      : ({
          data: undefined,
          isSuccess: false,
          error: batchCall.error || batchCall.data?.[0]?.error,
        } as const);

  const tvlLMR =
    batchCall.isSuccess && batchCall.data[1].status === "success"
      ? ({
          data: batchCall.data?.[1]?.result,
          isSuccess: true,
          error: undefined,
        } as const)
      : ({
          data: undefined,
          isSuccess: false,
          error: batchCall.error || batchCall.data?.[1]?.error,
        } as const);

  const totalPools =
    batchCall.isSuccess && batchCall.data[2].status === "success"
      ? ({
          data: batchCall.data?.[2]?.result,
          isSuccess: true,
          error: undefined,
        } as const)
      : ({
          data: undefined,
          isSuccess: false,
          error: batchCall.error || batchCall.data?.[2]?.error,
        } as const);

  return { totalPools, availableRewardsMOR, tvlLMR };
}
