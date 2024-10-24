import { decimalsLMR, decimalsMOR } from "../lib/units.ts";

export function apy(
  rewardPerSecondScaled: bigint,
  stakeAmount: bigint,
  totalShares: bigint,
  multiplierScaled: bigint,
  precision: bigint,
  morPrice: number,
  lmrPrice: number
) {
  if (totalShares === 0n) {
    return Infinity;
  }
  const shares = (stakeAmount * multiplierScaled) / precision;
  const fraction = Number(shares) / Number(totalShares + shares);

  const yearRewardMOR =
    (Number(rewardPerSecondScaled * 60n * 60n * 24n * 365n) / Number(precision)) * fraction;

  const yearRewardUSD = (Number(yearRewardMOR) / 10 ** Number(decimalsMOR)) * morPrice;
  const stakeUsd = (Number(stakeAmount) / 10 ** Number(decimalsLMR)) * lmrPrice;

  const apy = yearRewardUSD / stakeUsd;
  return apy;
}
