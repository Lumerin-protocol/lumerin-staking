import { decimalsLMR, decimalsMOR } from "../lib/units.ts";

export function apy2(
  rewardPerSecondScaled: bigint,
  totalShares: bigint,
  bestMultiplierScaled: bigint,
  precision: bigint,
  morPrice: number,
  lmrPrice: number
) {
  // best reward you can get is when you stake the same amount as already staked so your reward is 50% of the total reward
  const yearRewardMOR = (rewardPerSecondScaled * 60n * 60n * 24n * 365n) / 2n / precision;
  const optimalStakeLMR = (totalShares * precision) / bestMultiplierScaled;
  const yearRewardUSD = (Number(yearRewardMOR) / 10 ** Number(decimalsMOR)) * morPrice;
  const optimalStakeUSD = (Number(optimalStakeLMR) / 10 ** Number(decimalsLMR)) * lmrPrice;
  const apy = yearRewardUSD / optimalStakeUSD;
  return apy;
}
