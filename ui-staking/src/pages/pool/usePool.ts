import { useNavigate, useParams } from "react-router-dom";
import { useAccount, useBalance, useReadContract, useWriteContract } from "wagmi";
import { stakingMasterChefAbi } from "../../blockchain/abi.ts";
import { erc20Abi } from "viem";
import { mapPoolDataAndDerive } from "../../helpers/pool.ts";
import { useQueryClient } from "@tanstack/react-query";
import {
  filterPoolQuery,
  filterStakeQuery,
  filterUserBalanceQuery,
} from "../../helpers/invalidators.ts";
import { useTxModal } from "../../hooks/useTxModal.ts";
import { useBlockchainTime } from "../../hooks/useBlockchainTime.ts";
import { isErr } from "../../lib/error.ts";

export function usePool(onUpdate: () => void) {
  const writeContract = useWriteContract();

  const { poolId: poolIdString } = useParams();
  const poolId = poolIdString !== "" ? Number(poolIdString) : undefined;
  const navigate = useNavigate();

  const { address, chain } = useAccount();

  const timestamp = useBlockchainTime();

  const qc = useQueryClient();

  const poolDataArr = useReadContract({
    abi: stakingMasterChefAbi,
    address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
    functionName: "pools",
    args: [BigInt(poolId as number)],
  });

  const locks = useReadContract({
    abi: stakingMasterChefAbi,
    address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
    functionName: "getLockDurations",
    args: [BigInt(poolId as number)],
    query: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  });

  const stakes = useReadContract({
    abi: stakingMasterChefAbi,
    address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
    functionName: "getStakes",
    args: [address as `0x${string}`, BigInt(poolId as number)],
    query: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  });

  const poolNotFound =
    stakes.isError && isErr<typeof stakingMasterChefAbi>(stakes.error, "PoolOrStakeNotExists");

  const ethBalance = useBalance({
    address,
    query: { refetchOnMount: false, refetchOnReconnect: false, refetchOnWindowFocus: false },
  });

  const lmrBalance = useReadContract({
    abi: erc20Abi,
    address: process.env.REACT_APP_LMR_ADDR as `0x${string}`,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: address !== undefined,
    },
  });

  const morBalance = useReadContract({
    abi: erc20Abi,
    address: process.env.REACT_APP_MOR_ADDR as `0x${string}`,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: address !== undefined,
    },
  });

  const precision = useReadContract({
    abi: stakingMasterChefAbi,
    address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
    functionName: "PRECISION",
    query: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  });

  const withdrawModal = useTxModal();
  const unstakeModal = useTxModal();

  const locksMap = new Map<bigint, bigint>(
    locks.data?.map(({ durationSeconds, multiplierScaled }) => [durationSeconds, multiplierScaled])
  );

  const poolData = mapPoolDataAndDerive(poolDataArr.data, timestamp, precision.data);

  async function unstake(stakeId: bigint) {
    if (poolId === undefined) {
      console.error("No poolId");
      return;
    }

    await unstakeModal.start({
      txCall: async () =>
        writeContract.writeContractAsync({
          abi: stakingMasterChefAbi,
          address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
          functionName: "unstake",
          args: [BigInt(poolId), stakeId],
        }),
      onSuccess: async () => {
        await qc.invalidateQueries({
          predicate: filterPoolQuery(BigInt(poolId)),
          refetchType: "all",
        });
        await qc.invalidateQueries({
          predicate: filterStakeQuery(BigInt(poolId)),
          refetchType: "all",
        });
        if (address) {
          await qc.invalidateQueries({
            predicate: filterUserBalanceQuery(address),
            refetchType: "all",
          });
        }
        onUpdate();
      },
    });
  }

  async function withdraw(stakeId: bigint) {
    if (poolId === undefined) {
      console.error("No poolId");
      return;
    }

    await withdrawModal.start({
      txCall: async () =>
        writeContract.writeContractAsync({
          abi: stakingMasterChefAbi,
          address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
          functionName: "withdrawReward",
          args: [BigInt(poolId), stakeId],
        }),
      onSuccess: async () => {
        await qc.invalidateQueries({
          predicate: filterPoolQuery(BigInt(poolId)),
          refetchType: "all",
        });
        await qc.invalidateQueries({
          predicate: filterStakeQuery(BigInt(poolId)),
          refetchType: "all",
        });
        if (address) {
          await qc.invalidateQueries({
            predicate: filterUserBalanceQuery(address),
            refetchType: "all",
          });
        }
        writeContract.reset();
        onUpdate();
      },
    });
  }

  return {
    poolId,
    precision,
    chain,
    unstake,
    withdraw,
    timestamp,
    stakes,
    poolData,
    poolIsLoading: poolDataArr.isLoading,
    poolError: poolDataArr.error,
    poolNotFound,
    locks,
    locksMap,
    ethBalance,
    lmrBalance,
    morBalance,
    navigate,
    withdrawModal,
    unstakeModal,
  };
}
