import { Header } from "../../components/Header.tsx";
import { Container } from "../../components/Container.tsx";
import { usePools } from "./usePools.ts";
import { Spinner } from "../../icons/Spinner.tsx";
import { Link } from "react-router-dom";
import { BalanceLMR, BalanceMOR, PercentAPY } from "../../components/Balance.tsx";
import "./Pools.css";
import { MorpheusCircle } from "../../icons/MorpheusCircle.tsx";
import { Chevron } from "../../icons/Chevron.tsx";
import { LumerinCircle } from "../../icons/LumerinCircle.tsx";
import { formatDuration } from "../../lib/date.ts";

export const Pools = () => {
  const { poolsData, timestamp } = usePools();

  if (poolsData.error) {
    console.log(poolsData.error);
  }

  return (
    <>
      <Header />
      <main>
        <Container>
          <h1 className="pools-heading">Available Pools</h1>
          {poolsData.isLoading && <Spinner />}
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
                    <div className="pool-empty">
                      {/* <Link className="button" to={`/pools/${pool.id}/stake`}>
                        Stake LMR
                      </Link> */}
                    </div>
                    <div className="pool-action">
                      <Link className="button" to={`/pools/${pool.id}`}>
                        View Pool
                      </Link>
                    </div>
                  </div>
                  <dl className="pool-item-stats">
                    <dt title="The calculated Annual Percentage Yield (APY) is an estimate based on an ideal scenario, assuming no additional stakes are made">
                      Current APY *
                    </dt>
                    <dd title={pool.apy.toString()}>
                      {pool.apy ? <PercentAPY fraction={pool.apy} /> : "unknown"}
                    </dd>
                    <dt title="Total Value Locked (TVL) in staking">TVL *</dt>
                    <dd>
                      <BalanceLMR value={pool.pool.totalStaked} />
                    </dd>
                    <dt>Deposited</dt>
                    <dd>
                      <BalanceLMR value={pool.deposited} />
                    </dd>
                    <dt>Claimable</dt>
                    <dd>
                      <BalanceMOR value={pool.claimable} />
                    </dd>
                    {pool.pool.startTime > timestamp && (
                      <>
                        <dt>Starts in</dt>
                        <dd>
                          {formatDuration(pool.pool.startTime - timestamp, { compact: true })}
                        </dd>
                      </>
                    )}
                    {pool.pool.startTime < timestamp && pool.pool.endTime > timestamp && (
                      <>
                        <dt>Ends in</dt>
                        <dd>{formatDuration(pool.pool.endTime - timestamp, { compact: true })}</dd>
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
