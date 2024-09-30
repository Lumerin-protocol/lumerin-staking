import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { stakingMasterChefAbi } from "../../blockchain/abi.ts";
import { mapPoolData, PoolDataRaw } from "../../helpers/pool.ts";
import { getReward } from "../../helpers/reward.ts";
import { useBlockchainTime } from "../../hooks/useBlockchainTime.ts";
import { apy } from "../../helpers/apy.ts";
import { useRates } from "../../hooks/useRates.ts";
import { decimalsLMR } from "../../lib/units.ts";

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
  apy: number;
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

  const poolsData = useReadContracts({
    allowFailure: false,
    contracts: [
      ...createArray(
        Number(totalPools.data),
        (i) =>
          ({
            abi: stakingMasterChefAbi,
            address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
            functionName: "pools",
            args: [i],
          } as const)
      ),
      ...createArray(
        Number(totalPools.data),
        (i) =>
          ({
            abi: stakingMasterChefAbi,
            address: process.env.REACT_APP_STAKING_ADDR as `0x${string}`,
            functionName: "getStakes",
            args: [address, i],
          } as const)
      ),
    ],
    query: {
      select(data) {
        const poolAndStakes: PoolAndStakes[] = [];

        const rawPoolData = data.slice(0, Number(totalPools.data)) as PoolDataRaw[];
        const rawStakeData = data.slice(Number(totalPools.data)) as StakeData[][];

        for (let i = 0; i < Number(totalPools.data); i++) {
          const userStakes = rawStakeData[i].map((stake, j) => ({ id: j, ...stake }));
          const pool = mapPoolData(rawPoolData[i])!;

          poolAndStakes.push({
            id: i,
            pool,
            userStakes,
            deposited: userStakes.reduce((acc, stake) => acc + stake.stakeAmount, 0n),
            claimable: userStakes.reduce(
              (acc, stake) => acc + getReward(stake, pool, timestamp, precision.data!),
              0n
            ),
            apy: rates.isSuccess
              ? apy(
                  pool.rewardPerSecondScaled,
                  1n * 10n ** decimalsLMR,
                  pool.totalShares,
                  precision.data!,
                  precision.data!,
                  rates.data.mor,
                  rates.data.lmr
                )
              : 0,
          });
        }
        return poolAndStakes;
      },
    },
  });

  return { totalPools, poolsData, timestamp };
}

function createArray<T>(length: number, cb: (i: number) => T): T[] {
  return Array.from({ length }, (_, i) => cb(i));
}
