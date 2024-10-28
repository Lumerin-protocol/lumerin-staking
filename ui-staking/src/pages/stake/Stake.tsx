import { useAccount } from "wagmi";
import prettyMilliseconds from "pretty-ms";
import { ContainerNarrow } from "../../components/Container.tsx";
import { Header } from "../../components/Header.tsx";
import { LumerinIcon } from "../../icons/LumerinIcon.tsx";
import { RangeSelect } from "../../components/RangeSelect.tsx";
import { useStake } from "./useStake.ts";
import { formatDuration } from "../../lib/date.ts";
import { isErr } from "../../lib/error.ts";
import type { stakingMasterChefAbi } from "../../blockchain/abi.ts";
import { Spinner } from "../../icons/Spinner.tsx";
import { Dialog } from "../../components/Dialog.tsx";
import { formatLMR } from "../../lib/units.ts";
import { TxProgress } from "../../components/TxProgress.tsx";
import { getDisplayErrorMessage } from "../../helpers/error.ts";
import { BalanceLMR, BalanceUSD, DateTime, PercentAPY } from "../../components/Balance.tsx";
import { usePreventInputScroll } from "../../hooks/usePreventInputScroll.ts";
import "./Stake.css";

export const Stake = () => {
  const {
    timestamp,
    locks,
    poolData,
    apyValue,
    lockIndex,
    setLockIndex,
    navigate,
    poolId,
    onStake,
    multiplier,
    stakeAmount,
    stakeAmountDecimals,
    setStakeAmount,
    setMaxStakeAmount,
    stakeAmountValidErr,
    txModal,
    lockDurationSeconds,
    lockEndsAt,
    lmrBalance,
    lmrBalanceUsd,
    chain,
  } = useStake();

  const { isConnected } = useAccount();

  const inputRef = usePreventInputScroll();

  const isNoPoolError = isErr<typeof stakingMasterChefAbi>(locks.error, "PoolOrStakeNotExists");
  const isNoLockPeriods = locks.isSuccess && locks.data.length === 0;
  const isPoolExpired = poolData && timestamp > poolData.endTime;

  const rewardMultiplier =
    locks.isSuccess && multiplier.isSuccess
      ? Number(locks.data[lockIndex].multiplierScaled) / Number(multiplier.data)
      : 0;

  return (
    <>
      <Header />
      <main>
        <ContainerNarrow>
          <section className="section add-stake">
            <div className="row">
              <h1>Stake tokens</h1>
            </div>
            {locks.isLoading && <Spinner className="spinner-center" />}
            {(locks.isError || isNoLockPeriods || isPoolExpired) && (
              <div className="row">
                <div className="error">
                  {isNoPoolError && "Pool not found"}
                  {locks.isError && !isNoPoolError && "Pool error"}
                  {isNoLockPeriods && "Lock periods not set"}
                  {isPoolExpired && "Pool ended"}
                </div>
              </div>
            )}
            {locks.isSuccess && !isNoLockPeriods && !isPoolExpired && (
              <>
                <div className="row row-stake-amount">
                  <div className="field stake-amount">
                    <div className="field-input">
                      <div className="input-field-wrap">
                        <input
                          // biome-ignore lint/a11y/noAutofocus: the main focus is on this input
                          autoFocus
                          ref={inputRef}
                          id="stake-amount"
                          type="number"
                          value={stakeAmount}
                          placeholder="Amount"
                          onFocus={(e) => e.currentTarget.select()}
                          onChange={(e) =>
                            setStakeAmount(
                              e.target.value === "" || Number(e.target.value) > 0
                                ? e.target.value
                                : "0"
                            )
                          }
                        />
                        <button
                          className="button input-max"
                          type="button"
                          onClick={setMaxStakeAmount}
                        >
                          Max
                        </button>
                      </div>
                      <label htmlFor="stake-amount">
                        <LumerinIcon /> LMR
                      </label>
                    </div>
                    <div className="lmr-balance">
                      <div className="title">Balance</div>
                      <div className="value">
                        <BalanceLMR value={lmrBalance.data || 0n} /> ≈{" "}
                        <BalanceUSD value={lmrBalanceUsd.data || 0} />
                      </div>
                    </div>
                    <div className="field-error">{stakeAmountValidErr}</div>
                  </div>
                </div>
                <div className="row">
                  <div className="field lockup-period">
                    <label htmlFor="lockup-period">Lockup period</label>
                    <div className="range-wrap">
                      <RangeSelect
                        label="Lockup period"
                        value={lockIndex}
                        titles={locks.data.map((l) => formatSeconds(l.durationSeconds))}
                        titlesShort={locks.data.map((l) => formatDuration(l.durationSeconds))}
                        onChange={setLockIndex}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="field summary">
                    <h2>Stake Summary</h2>
                    <dl>
                      <dt className="has-tooltip">
                        APY *
                        <div className="tooltip">
                          The calculated APY is an estimate based on an ideal scenario, assuming no
                          additional stakes are made
                        </div>
                      </dt>
                      <dd>
                        <PercentAPY fraction={apyValue || 0} />{" "}
                      </dd>
                      <dt>Lockup Period</dt>
                      <dd>{formatSeconds(lockDurationSeconds)}</dd>
                      <dt>Reward multiplier</dt>
                      <dd>{rewardMultiplier}x</dd>
                      <dt>Lockup ends at</dt>
                      <dd className="lockup-ends-value">
                        {lockEndsAt ? <DateTime epochSeconds={lockEndsAt} /> : "unknown"}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="row">
                  <div className="field buttons">
                    <button
                      className="button"
                      type="button"
                      onClick={() => navigate(`/pools/${poolId}`)}
                    >
                      Cancel
                    </button>
                    <button
                      className="button button-primary"
                      type="submit"
                      onClick={onStake}
                      title={!isConnected ? "Connect wallet" : ""}
                      disabled={stakeAmount === "0" || stakeAmountValidErr !== "" || !isConnected}
                    >
                      Stake
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
          {txModal.isVisible && (
            <Dialog onDismiss={() => txModal.reset()}>
              <div className="dialog-content">
                <h2>Staking transaction</h2>
                <p>
                  Staking {formatLMR(stakeAmountDecimals)} with lock period of{" "}
                  {formatDuration(lockDurationSeconds, { verbose: true })}.
                </p>
                <ul className="tx-stages">
                  <li>
                    <div className="stage-name">Approving funds</div>
                    <div className="stage-progress">
                      <TxProgress
                        chain={chain}
                        skippedMessage={
                          txModal.approveTxHash?.hash === "0x0"
                            ? "Funds already approved"
                            : undefined
                        }
                        isTransacting={txModal.isApproving}
                        txHash={txModal.approveTxHash?.hash}
                        action={`Approved ${formatLMR(txModal.approveTxHash?.value || 0n)}.`}
                        error={getDisplayErrorMessage(txModal.approveError)}
                      />
                    </div>
                  </li>
                  <li>
                    <div className="stage-name">Adding stake</div>
                    <div className="stage-progress">
                      <TxProgress
                        chain={chain}
                        isTransacting={txModal.isTransacting}
                        txHash={txModal.txHash?.hash}
                        action={`Staked ${formatLMR(stakeAmountDecimals)}.`}
                        error={getDisplayErrorMessage(txModal.txError)}
                      />
                    </div>
                  </li>
                </ul>
                <button
                  className="button button-small button-primary"
                  type="button"
                  onClick={() => {
                    txModal.reset();
                    if (txModal.isTransactionSuccess) {
                      navigate(`/pools/${poolId}`);
                    }
                  }}
                >
                  OK
                </button>
              </div>
            </Dialog>
          )}
        </ContainerNarrow>
      </main>
    </>
  );
};

function formatSeconds(seconds: number | bigint): string {
  let ms: number | bigint;
  if (typeof seconds === "bigint") {
    ms = seconds * 1000n;
  } else {
    ms = seconds * 1000;
  }
  return prettyMilliseconds(ms, { verbose: true });
}
