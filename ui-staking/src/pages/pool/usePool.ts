import { useNavigate, useParams } from "react-router-dom";
import { useAccount, useBalance, useConfig, useReadContract, useWriteContract } from "wagmi";
import { stakingMasterChefAbi } from "../../blockchain/abi.ts";
import { erc20Abi, getAddress, parseEventLogs } from "viem";
import { mapPoolDataAndDerive } from "../../helpers/pool.ts";
import { useQueryClient } from "@tanstack/react-query";
import {
  filterPoolQuery,
  filterStakeQuery,
  filterUserETHBalanceQuery,
  filterUserLMRBalanceQuery,
  filterUserMORBalanceQuery,
} from "../../helpers/invalidators.ts";
import { TxResult, useTxModal } from "../../hooks/useTxModal.ts";
import { useBlockchainTime } from "../../hooks/useBlockchainTime.ts";
import { isErr } from "../../lib/error.ts";
import { waitForTransactionReceipt } from "wagmi/actions";

export function usePool(onUpdate: () => void) {
  const config = useConfig();
  const writeContract = useWriteContract();

  const { poolId: poolIdString } = useParams();
  const poolId = poolIdString !== "" ? Number(poolIdString) : undefined;

  const navigate = useNavigate();
  const { address, chain, isConnected } = useAccount();
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
      enabled: address !== undefined,
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
  const unstakeModal = useTxModal<
    TxResult,
    { hash: `0x${string}`; valueMOR: bigint; valueLMR: bigint }
  >();

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
      txCall: async () => {
        const hash = await writeContract.writeContractAsync({
          abi: stakingMasterChefAbi,
          address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
          functionName: "unstake",
          args: [BigInt(poolId), stakeId],
        });
        const tx = await waitForTransactionReceipt(config, { hash });
        let valueMOR = BigInt(0);
        let valueLMR = BigInt(0);
        const logs = parseEventLogs({ abi: erc20Abi, logs: tx.logs, eventName: "Transfer" });
        for (const log of logs) {
          if (getAddress(log.address) === getAddress(process.env.REACT_APP_MOR_ADDR)) {
            valueMOR = log.args.value;
          } else if (getAddress(log.address) === getAddress(process.env.REACT_APP_LMR_ADDR)) {
            valueLMR = log.args.value;
          }
        }
        return { hash, valueMOR, valueLMR };
      },
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
            predicate: filterUserLMRBalanceQuery(address),
            refetchType: "all",
          });
          await qc.invalidateQueries({
            predicate: filterUserMORBalanceQuery(address),
            refetchType: "all",
          });
          await qc.invalidateQueries({
            predicate: filterUserETHBalanceQuery(address),
            refetchType: "all",
          });
        }
        writeContract.reset();
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
      txCall: async () => {
        const hash = await writeContract.writeContractAsync({
          abi: stakingMasterChefAbi,
          address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
          functionName: "withdrawReward",
          args: [BigInt(poolId), stakeId],
        });
        const tx = await waitForTransactionReceipt(config, { hash });
        const logs = parseEventLogs({
          abi: stakingMasterChefAbi,
          logs: tx.logs,
          eventName: "RewardWithdrawal",
        });
        const value = logs?.[0].args.amount;
        return { hash, value };
      },
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
            predicate: filterUserMORBalanceQuery(address),
            refetchType: "all",
          });
          await qc.invalidateQueries({
            predicate: filterUserETHBalanceQuery(address),
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
    isDisconnected: !isConnected,
  };
}
