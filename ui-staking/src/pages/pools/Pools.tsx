import { Link } from "react-router-dom";
import { Header } from "../../components/Header.tsx";
import { Container } from "../../components/Container.tsx";
import { usePools } from "./usePools.ts";
import { Spinner } from "../../icons/Spinner.tsx";
import { BalanceLMR, BalanceMOR, PercentAPYRange } from "../../components/Balance.tsx";
import { MorpheusCircle } from "../../icons/MorpheusCircle.tsx";
import { Chevron } from "../../icons/Chevron.tsx";
import { LumerinCircle } from "../../icons/LumerinCircle.tsx";
import { formatDuration } from "../../lib/date.ts";
import "./Pools.css";
import { max } from "../../lib/bigint.ts";

export const Pools = () => {
  const { poolsData, timestamp } = usePools();

  if (poolsData.error) {
    console.error(poolsData.error);
  }

  return (
    <>
      <Header />
      <main>
        <Container>
          <h1 className="pools-heading">Available Pools</h1>
          {poolsData.isLoading && (
            <div className="spinner-container">
              <Spinner />
            </div>
          )}
          {poolsData.error && <p>Error loading pools. Make sure you connected your wallet.</p>}
          {poolsData.data?.length === 0 && <p>No pools available</p>}
          {poolsData.isSuccess && (
            <ul className="pool-list">
              {poolsData.data.map((pool) => (
                <li className="pool-item" key={pool.id}>
                  <div className="pool-item-title">
                    <div className="pool-icon">
                      <LumerinCircle width={50} height={50} className="from" />
                      <MorpheusCircle width={50} height={50} className="to" />
                    </div>
                    <div className="pool-name">
                      LMR <Chevron className="pool-direction-chevron" angle={90} width="0.7em" />{" "}
                      MOR
                    </div>
                    <div className="pool-empty"></div>
                    <div className="pool-action">
                      <Link className="button" to={`/pools/${pool.id}`}>
                        View Pool
                      </Link>
                    </div>
                  </div>
                  <dl className="pool-item-stats">
                    <dt>
                      <div className="has-tooltip">
                        Current APY *
                        <div className="tooltip">
                          The calculated Annual Percentage Yield (APY) is an estimate based on an
                          ideal scenario, assuming the maximum lock period multiplier is used and no
                          new stakes are added
                        </div>
                      </div>
                    </dt>
                    <dd>
                      {pool.apy ? <PercentAPYRange min={pool.apy.min} max={pool.apy.max} /> : "n/a"}
                    </dd>
                    <dt>
                      <div className="has-tooltip">
                        TVL *<div className="tooltip">Total Value Locked (TVL) in the pool</div>
                      </div>
                    </dt>
                    <dd>
                      <BalanceLMR value={pool.pool.totalStaked} />
                    </dd>
                    <dt>Total reward</dt>
                    <dd>
                      <BalanceMOR value={pool.totalReward} />
                    </dd>
                    <dt>You've deposited</dt>
                    <dd>
                      <BalanceLMR value={pool.deposited} />
                    </dd>
                    {pool.pool.startTime > timestamp && (
                      <>
                        <dt>Starts in</dt>
                        <dd>
                          {formatDuration(pool.pool.startTime - timestamp, {
                            compact: true,
                            verbose: true,
                          })}
                        </dd>
                      </>
                    )}
                    {pool.pool.startTime < timestamp && pool.pool.endTime > timestamp && (
                      <>
                        <dt>Ends in</dt>
                        <dd>
                          {formatDuration(pool.pool.endTime - timestamp, {
                            compact: true,
                            verbose: true,
                          })}
                        </dd>
                      </>
                    )}
                    {pool.pool.endTime < timestamp && (
                      <>
                        <dt>Ends in</dt>
                        <dd>Pool ended</dd>
                      </>
                    )}
                    {}
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
    </>
  );
};
