import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { stakingMasterChefAbi } from "../../blockchain/abi.ts";
import { mapPoolData, PoolDataRaw } from "../../helpers/pool.ts";
import { getReward } from "../../helpers/reward.ts";
import { useBlockchainTime } from "../../hooks/useBlockchainTime.ts";
import { apy } from "../../helpers/apy.ts";
import { useRates } from "../../hooks/useRates.ts";
import { decimalsLMR } from "../../lib/units.ts";
import { ReadContractErrorType } from "viem";

interface PoolData {
  rewardPerSecondScaled: bigint;
  lastRewardTime: bigint;
  accRewardPerShareScaled: bigint;
  totalShares: bigint;
  totalStaked: bigint;
  startTime: bigint;
  endTime: bigint;
}

interface StakeData {
  stakeAmount: bigint;
  shareAmount: bigint;
  rewardDebt: bigint;
  stakedAt: bigint;
  lockEndsAt: bigint;
}

type AddId<T> = T & { id: number };

// Single pool and all stakes for the current user
interface PoolAndStakes {
  id: number;
  pool: PoolData;
  userStakes: AddId<StakeData>[];
  deposited: bigint;
  claimable: bigint;
  apy: { min: number; max: number } | null;
}

interface LockDuration {
  durationSeconds: bigint;
  multiplierScaled: bigint;
}

export function usePools() {
  const { address } = useAccount();
  const timestamp = useBlockchainTime();
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

  const totalPools = useReadContract({
    abi: stakingMasterChefAbi,
    address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
    functionName: "getPoolsCount",
    args: [],
  });

  const rates = useRates();

  const rawPoolsData = useReadContracts({
    allowFailure: false,
    contracts: createArray(
      Number(totalPools.data),
      (i) =>
        ({
          abi: stakingMasterChefAbi,
          address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
          functionName: "pools",
          args: [i],
        } as const)
    ),
  });

  const lockDurations = useReadContracts({
    allowFailure: false,
    contracts: createArray(
      Number(totalPools.data),
      (i) =>
        ({
          abi: stakingMasterChefAbi,
          address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
          functionName: "getLockDurations",
          args: [i],
        } as const)
    ),
  });

  const rawStakeData = useReadContracts({
    allowFailure: false,
    contracts: createArray(
      Number(totalPools.data),
      (i) =>
        ({
          abi: stakingMasterChefAbi,
          address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
          functionName: "getStakes",
          args: [address, i],
        } as const)
    ),
    query: {
      enabled: address !== undefined,
    },
  });

  const isLoading =
    rawPoolsData.isLoading ||
    rawStakeData.isLoading ||
    lockDurations.isLoading ||
    precision.isLoading;

  const isSuccess = rawPoolsData.isSuccess && lockDurations.isSuccess && precision.isSuccess;

  const error = rawPoolsData.error || rawStakeData.error || lockDurations.error || precision.error;

  console.log(rawStakeData.data, rawStakeData.error, rawStakeData.isLoading);

  const data = isSuccess
    ? mapPoolAndStakes(
        rawPoolsData.data,
        lockDurations.data,
        rawStakeData.data || [], // loading stakes is deferred until the user is logged in
        precision.data,
        timestamp,
        rates.data?.mor || 0,
        rates.data?.lmr || 0
      )
    : undefined;

  // const poolsData = isSuccess ? {}

  return {
    totalPools,
    poolsData: isSuccess
      ? {
          data: mapPoolAndStakes(
            rawPoolsData.data,
            lockDurations.data,
            rawStakeData.data || [], // loading stakes is deferred until the user is logged in
            precision.data,
            timestamp,
            rates.data?.mor || 0,
            rates.data?.lmr || 0
          ),
          isLoading: false as const,
          isSuccess: true as const,
          error: null,
        }
      : { isLoading, isSuccess: false as const, error: error as ReadContractErrorType },
    timestamp,
  };
}

function createArray<T>(length: number, cb: (i: number) => T): T[] {
  return Array.from({ length }, (_, i) => cb(i));
}

function mapPoolAndStakes(
  rawPoolData: PoolDataRaw[],
  rawLockDurations: (readonly LockDuration[])[],
  rawStakeData: (readonly StakeData[])[],
  precision: bigint,
  timestamp: bigint,
  morRate: number,
  lmrRate: number
): PoolAndStakes[] {
  const poolAndStakes: PoolAndStakes[] = [];

  for (let i = 0; i < Number(rawPoolData.length); i++) {
    const pool = mapPoolData(rawPoolData[i])!;
    const userStakes = rawStakeData?.[i]?.map((stake, j) => ({ id: j, ...stake })) || [];
    const bestMultiplierScaled = rawLockDurations[i].reduce<bigint>(
      (acc, cur) => (cur.multiplierScaled > acc ? cur.multiplierScaled : acc),
      0n
    );
    const worstMultiplierScaled = rawLockDurations[i].reduce<bigint>(
      (acc, cur) => (cur.multiplierScaled < acc ? cur.multiplierScaled : acc),
      bestMultiplierScaled
    );

    const apyData =
      morRate && lmrRate
        ? {
            min: apy(
              pool.rewardPerSecondScaled,
              1n,
              pool.totalShares,
              worstMultiplierScaled,
              precision,
              morRate,
              lmrRate
            ),
            max: apy(
              pool.rewardPerSecondScaled,
              1n * 10n ** decimalsLMR,
              pool.totalShares,
              bestMultiplierScaled,
              precision,
              morRate,
              lmrRate
            ),
          }
        : null;

    poolAndStakes.push({
      id: i,
      pool,
      userStakes,
      deposited: userStakes.reduce((acc, stake) => acc + stake.stakeAmount, 0n),
      claimable: userStakes.reduce(
        (acc, stake) => acc + getReward(stake, pool, timestamp, precision),
        0n
      ),
      apy: apyData,
    });
  }
  return poolAndStakes;
}
