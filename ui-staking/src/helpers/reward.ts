export interface Pool {
  lastRewardTime: bigint;
  rewardPerSecondScaled: bigint;
  accRewardPerShareScaled: bigint;
  totalShares: bigint;
  startTime: bigint;
  endTime: bigint;
}

export interface UserStake {
  shareAmount: bigint;
  rewardDebt: bigint;
  lockEndsAt: bigint;
  stakeAmount: bigint;
}

export const getRewardPerShareScaled = (pool: Pool, timestamp: bigint): bigint => {
  if (pool.totalShares === 0n) {
    return 0n;
  }
  if (pool.lastRewardTime >= timestamp) {
    return 0n;
  }
  const rewardScaled = (timestamp - pool.lastRewardTime) * pool.rewardPerSecondScaled;
  return pool.accRewardPerShareScaled + rewardScaled / pool.totalShares;
};

export const getReward = (
  userStake: UserStake,
  pool: Pool,
  timestamp: bigint,
  precision: bigint
): bigint => {
  const endTime = pool.endTime > timestamp ? timestamp : pool.endTime;
  const rewardPerShareScaled = getRewardPerShareScaled(pool, endTime);
  const reward = (userStake.shareAmount * rewardPerShareScaled) / precision - userStake.rewardDebt;
  // rewardDebt that is not updated can cause negative reward
  if (reward < 0n) {
    return 0n;
  }
  return reward;
};
