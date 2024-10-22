import * as fixtures from "../test/fixtures";
import * as fixturesStaking from "../test/Staking/fixtures";
import { HOUR, SECOND } from "../utils/time";
import hre from "hardhat";

async function main() {
  const pubClient = await hre.viem.getPublicClient();
  const data = await fixtures.deployMORtoken();
  const lmr = await fixturesStaking.deployLMR();
  const { staking, precision } = await fixturesStaking.deployStaking(
    lmr.address,
    data.tokenMOR.address,
  );

  const block = await pubClient.getBlock();
  const startDate = block.timestamp;
  const duration = 48n * BigInt(HOUR / SECOND);
  const rewardPerSecond = (115n * 10n ** 18n) / 1_000_000n;
  const totalReward = rewardPerSecond * duration;

  await data.tokenMOR.write.approve([staking.address, totalReward * 2n]);
  await fixturesStaking.setupPools(staking.address, [
    {
      durationSeconds: duration,
      startDate,
      totalReward: totalReward,
      lockDurations: fixturesStaking.getDefaultDurationsShort(precision),
    },
    {
      durationSeconds: duration,
      startDate,
      totalReward: totalReward,
      lockDurations: fixturesStaking.getDefaultDurations(precision),
    },
  ]);

  const stakingAmount = 10n * 10n ** 8n;
  const lockDurationId = 0;
  const poolId = 0n;
  const [_, alice, bob] = await hre.viem.getWalletClients();

  await lmr.write.transfer([alice.account.address, stakingAmount * 100n]);
  await lmr.write.transfer([bob.account.address, stakingAmount * 100n]);

  for (let i = 0; i < 3; i++) {
    await lmr.write.approve([staking.address, stakingAmount], {
      account: alice.account,
    });
    await staking.write.stake([poolId, stakingAmount, lockDurationId], {
      account: alice.account,
    });
  }

  for (let i = 0; i < 3; i++) {
    await lmr.write.approve([staking.address, stakingAmount], {
      account: bob.account,
    });
    await staking.write.stake([poolId, stakingAmount, lockDurationId], {
      account: bob.account,
    });
  }

  // const stakeId = await getStakeId(depositTx);

  console.log(`
    MOR token       ${data.tokenMOR.address}
    LMR token       ${lmr.address}
    Staking         ${staking.address}


    Owner:          ${data.owner.account.address}
    Alice:          ${alice.account.address}
    Bob:            ${bob.account.address}
  `);
}

main();
