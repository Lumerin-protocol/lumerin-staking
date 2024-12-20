export type PoolDataRaw =
  | readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint]
  | undefined;

export function mapPoolData(poolData: PoolDataRaw) {
  if (!poolData) {
    return undefined;
  }
  const [
    rewardPerSecondScaled,
    lastRewardTime,
    accRewardPerShareScaled,
    totalShares,
    totalStaked,
    startTime,
    endTime,
  ] = poolData;

  return {
    rewardPerSecondScaled,
    lastRewardTime,
    accRewardPerShareScaled,
    totalShares,
    totalStaked,
    startTime,
    endTime,
  };
}

export function mapPoolDataAndDerive(
  poolData: PoolDataRaw,
  timestamp: bigint,
  precision: bigint | undefined
) {
  const poolDataParsed = mapPoolData(poolData);
  if (!precision || !poolDataParsed) {
    return undefined;
  }
  const {
    rewardPerSecondScaled,
    lastRewardTime,
    accRewardPerShareScaled,
    totalShares,
    totalStaked,
    startTime,
    endTime,
  } = poolDataParsed;

  const poolDuration = endTime - startTime;
  const isFinished = timestamp > endTime;
  const isPrestaking = timestamp < startTime && !isFinished;
  const poolElapsedDays = poolData ? Math.floor(Number(timestamp - startTime) / 86400) : 0;
  const poolTotalDays = poolData ? Math.floor(Number(poolDuration) / 86400) : 0;
  const poolRemainingSeconds = poolData ? Number(endTime - timestamp) : 0;
  let poolProgress = poolData ? Number(timestamp - startTime) / Number(poolDuration) : 0;

  if (poolProgress < 0) {
    poolProgress = 0;
  }
  if (poolProgress > 1) {
    poolProgress = 1;
  }

  const totalRewards = (poolDuration * rewardPerSecondScaled) / precision;
  const unlockedRewards = BigInt(Math.trunc(Number(totalRewards) * poolProgress));
  const lockedRewards = totalRewards - unlockedRewards;

  return {
    rewardPerSecondScaled,
    lastRewardTime,
    accRewardPerShareScaled,
    totalShares,
    totalStaked,
    startTime,
    endTime,
    poolDuration,
    poolProgress,
    poolElapsedDays,
    poolTotalDays,
    poolRemainingSeconds,
    totalRewards,
    lockedRewards,
    unlockedRewards,
    isPrestaking,
    isFinished,
  };
}

export function isPoolActive(pool: ReturnType<typeof mapPoolData>, timestamp: bigint) {
  if (!pool) {
    return false;
  }

  if (pool.endTime < timestamp && pool.totalShares === 0n) {
    // Skip pools that have ended and all rewards have been claimed
    // This also filters out pools that were done by mistake
    return false;
  }

  return true;
}
