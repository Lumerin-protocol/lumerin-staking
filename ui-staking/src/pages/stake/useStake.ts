import { useAccount, useConfig, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { erc20Abi, stakingMasterChefAbi } from "../../blockchain/abi.ts";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { mapPoolData } from "../../helpers/pool.ts";
import { decimalsLMR } from "../../lib/units.ts";
import { useQueryClient } from "@tanstack/react-query";
import {
  filterPoolQuery,
  filterStakeQuery,
  filterUserLMRBalanceQuery,
} from "../../helpers/invalidators.ts";
import { useTxModal } from "../../hooks/useTxModal.ts";
import { formatUnits, parseEventLogs } from "viem";
import { useBlockchainTime } from "../../hooks/useBlockchainTime.ts";
import { apy } from "../../helpers/apy.ts";
import { useRates } from "../../hooks/useRates.ts";
import { parseDecimal } from "../../lib/decimal.ts";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";

export function useStake() {
  // set initial state
  const { poolId: poolIdString } = useParams();
  const { address, chain } = useAccount();
  const poolId = Number(poolIdString);
  const navigate = useNavigate();

  const [lockIndex, setLockIndex] = useState(0);
  const [stakeAmount, _setStakeAmount] = useState("0");
  const [stakeAmountValidEnabled, setStakeAmountValidEnabled] = useState(false);
  const txModal = useTxModal();
  const config = useConfig();

  const timestamp = useBlockchainTime();

  const qc = useQueryClient();

  function setStakeAmount(value: string) {
    _setStakeAmount(value);
    setStakeAmountValidEnabled(true);
  }

  // load asynchronous data
  const locks = useReadContract({
    abi: stakingMasterChefAbi,
    address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
    functionName: "getLockDurations",
    args: [BigInt(poolId)],
    query: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  });

  // set lockup period slider to a second position if there are more than one lockup periods
  useEffect(() => {
    if (locks.data?.length && locks.data?.length > 1) {
      setLockIndex(1);
    }
  }, [locks.data?.length]);

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

  const lmrBalance = useReadContract({
    abi: erc20Abi,
    address: process.env.REACT_APP_LMR_ADDR as `0x${string}`,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: address !== undefined,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  });

  const pool = useReadContract({
    abi: stakingMasterChefAbi,
    address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
    functionName: "pools",
    args: [BigInt(poolId)],
    query: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  });

  const rates = useRates();

  const lmrBalanceUsd = {
    isLoading: lmrBalance.isLoading || rates.isLoading,
    isSuccess: lmrBalance.isSuccess && rates.isSuccess,
    isError: lmrBalance.isError || rates.isError,
    error: lmrBalance.error || rates.error,
    data:
      lmrBalance.data &&
      rates.data &&
      (Number(lmrBalance.data) / Number(10n ** decimalsLMR)) * rates.data.lmr,
  };

  const poolData = mapPoolData(pool.data);

  // perform input validations
  const { value: stakeAmountDecimals, error: stakeAmountValidErr } = validStakeAmount(
    stakeAmount,
    lmrBalance.data,
    Number(decimalsLMR),
    stakeAmountValidEnabled
  );

  const lockDurationSeconds = locks.data?.[lockIndex].durationSeconds || 0n;
  const effectiveStakeStartTime =
    poolData && timestamp > poolData?.startTime ? timestamp : poolData?.startTime;
  const lockEndsAt = effectiveStakeStartTime && effectiveStakeStartTime + lockDurationSeconds;

  const apyValue =
    poolData && locks.isSuccess && precision.isSuccess && rates.isSuccess
      ? apy(
          poolData.rewardPerSecondScaled,
          stakeAmountDecimals,
          poolData.totalShares,
          locks.data?.[lockIndex].multiplierScaled,
          precision.data,
          rates.data?.mor,
          rates.data?.lmr
        )
      : 0;

  const pubClient = usePublicClient();
  const writeContract = useWriteContract();

  // define asynchronous calls
  async function onStake() {
    if (!pubClient) {
      console.error("Public client not initialized");
      return;
    }

    if (!address) {
      console.error("No address");
      return;
    }

    await txModal.start({
      approveCall: async () => {
        const currentAllowance = await readContract(config, {
          abi: erc20Abi,
          address: process.env.REACT_APP_LMR_ADDR as `0x${string}`,
          functionName: "allowance",
          args: [address, process.env.REACT_APP_STAKING_ADDR as `0x${string}`],
        });
        if (currentAllowance >= stakeAmountDecimals) {
          return { hash: "0x0", value: currentAllowance };
        }

        const hash = await writeContract.writeContractAsync({
          abi: erc20Abi,
          address: process.env.REACT_APP_LMR_ADDR as `0x${string}`,
          functionName: "approve",
          args: [process.env.REACT_APP_STAKING_ADDR as `0x${string}`, stakeAmountDecimals],
        });
        const receipt = await waitForTransactionReceipt(config, { hash });
        const event = parseEventLogs({ abi: erc20Abi, logs: receipt.logs }).find(
          (e) => e.eventName === "Approval"
        );
        return { hash, value: event?.args.value || 0n };
      },
      txCall: async () => {
        const hash = await writeContract.writeContractAsync({
          abi: [...stakingMasterChefAbi, ...erc20Abi],
          address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
          functionName: "stake",
          args: [BigInt(poolId), stakeAmountDecimals, lockIndex],
        });
        await waitForTransactionReceipt(config, { hash });
        return { hash, value: 0n };
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
        await qc.invalidateQueries({
          predicate: filterUserLMRBalanceQuery(address),
          refetchType: "all",
        });
      },
    });
  }

  async function setMaxStakeAmount() {
    if (!lmrBalance.data) {
      return;
    }
    setStakeAmount(formatUnits(lmrBalance.data, Number(decimalsLMR)));
  }

  return {
    txModal,
    poolId,
    poolData,
    apyValue,
    chain,
    locks,
    pubClient,
    navigate,
    timestamp,
    multiplier: precision,
    lockIndex,
    setLockIndex,
    onStake,
    lmrBalance,
    lmrBalanceUsd,
    stakeAmount,
    setStakeAmount,
    setMaxStakeAmount,
    writeContract,
    stakeAmountDecimals,
    stakeAmountValidErr,
    lockDurationSeconds,
    effectiveStakeStartTime,
    lockEndsAt,
  };
}

function validStakeAmount(
  amount: string,
  balance: bigint | undefined,
  decimals: number | undefined,
  enabled: boolean
): { value: bigint; error: string | null } {
  if (!enabled) {
    return { value: 0n, error: "" };
  }
  if (amount === "") {
    return { value: 0n, error: "Enter stake amount" };
  }
  if (!decimals) {
    return { value: 0n, error: "" };
  }
  try {
    const value = parseDecimal(amount, decimals);
    if (balance !== undefined && value > balance) {
      return { value, error: "Insufficient LMR balance" };
    }

    return { value, error: "" };
  } catch (e) {
    return { value: 0n, error: (e as Error).message };
  }
}
