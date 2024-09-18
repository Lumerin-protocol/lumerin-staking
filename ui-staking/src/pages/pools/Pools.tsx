import { Header } from "../../components/Header.tsx";
import { Container } from "../../components/Container.tsx";
import { usePools } from "./usePools.ts";
import { Spinner } from "../../icons/Spinner.tsx";
import { Link } from "react-router-dom";
import { BalanceLMR, BalanceMOR } from "../../components/Balance.tsx";
import "./Pools.css";
import { MorpheusCircle } from "../../icons/MorpheusCircle.tsx";
import { Arrow } from "../../icons/Arrow.tsx";
import { formatPercent } from "../../lib/units.ts";

export const Pools = () => {
  const { poolsData } = usePools();

  return (
    <>
      <Header />
      <main>
        <Container>
          <h1 className="pools-heading">Available Pools</h1>
          {poolsData.isLoading && <Spinner />}
          {poolsData.error && <p>Error loading pools</p>}
          {poolsData.data?.length === 0 && <p>No pools available</p>}
          {poolsData.isSuccess && (
            <ul className="pool-list">
              {poolsData.data.map((pool) => (
                <li className="pool-item">
                  <div className="pool-item-title">
                    <div className="pool-icon">
                      <MorpheusCircle width={50} height={50} />
                    </div>
                    <div className="pool-name">
                      LMR <Arrow className="pool-direction-chevron" angle={90} width="0.7em" /> MOR
                    </div>
                    <div className="pool-action">
                      <Link className="button button-primary" to={`/pools/${pool.id}/stake`}>
                        Stake LMR
                      </Link>
                    </div>
                    <div className="pool-action">
                      <Link className="button" to={`/pools/${pool.id}`}>
                        View Pool
                      </Link>
                    </div>
                  </div>
                  <dl className="pool-item-stats">
                    <dt>Current APY</dt>
                    <dd>{formatPercent(pool.apy)}</dd>
                    <dt>Total Value Locked</dt>
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
