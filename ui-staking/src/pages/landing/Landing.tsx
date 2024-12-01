import { useAccount, useDisconnect } from "wagmi";
import { Container } from "../../components/Container.tsx";
import homeElement from "../../images/home-element.webp";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../../components/Button.tsx";
import { useWeb3Modal, useWeb3ModalEvents } from "@web3modal/wagmi/react";
import { Header } from "../../components/Header.tsx";
import { BalanceLMR, BalanceMOR } from "../../components/Balance.tsx";
import { useLanding } from "./useLanding.ts";
import "./Landing.css";
import { Arrow } from "../../icons/Arrow.tsx";
import { Spinner } from "../../icons/Spinner.tsx";

export const Landing = () => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { open } = useWeb3Modal();
  const event = useWeb3ModalEvents();

  useEffect(() => {
    if (event.data.event === "CONNECT_SUCCESS") {
      navigate("/pools");
    }
  }, [event, navigate]);

  const { activePoolsCount, balanceAndPoolCount } = useLanding();

  return (
    <>
      <Header hideWallet />
      <img className="home-element" src={homeElement} alt="Home Element" />
      <Container>
        <h1 className="cta">
          Stake LMR,
          <br />
          Get MOR
        </h1>
        <h2 className="sub-cta">Your Pathway to Effortless Rewards</h2>
        <div className="cta-buttons">
          {isConnected ? (
            <>
              <Link className="button button-primary" to="/pools">
                Stake LMR
              </Link>
              <Button onClick={() => disconnect()}>Disconnect</Button>
            </>
          ) : (
            <>
              <Button className="button-primary" onClick={() => open({ view: "Connect" })}>
                Connect Wallet <Arrow />
              </Button>
              <Link className="button" to="/pools">
                View Pools
              </Link>
            </>
          )}
        </div>
        <div className="cta-stats">
          {/* TODO: move combining loading and error states to a hook */}
          {(balanceAndPoolCount.isLoading || activePoolsCount.isLoading) && (
            <Spinner className="spinner-center" />
          )}
          {(balanceAndPoolCount.isError || activePoolsCount.isError) && (
            <p>Error loading stats data</p>
          )}
          {balanceAndPoolCount.isSuccess && activePoolsCount.isSuccess && (
            <>
              <div className="cta-stat">
                <p>{String(activePoolsCount.data)}</p>
                <h3>Total Pools</h3>
              </div>
              <div className="cta-stat">
                <p>
                  <BalanceMOR value={balanceAndPoolCount.data.availableRewardsMOR} />
                </p>
                <h3>Available Rewards</h3>
              </div>
              <div className="cta-stat">
                <p>
                  <BalanceLMR value={balanceAndPoolCount.data.tvlLMR} />
                </p>
                <h3>Total Value Locked</h3>
              </div>
            </>
          )}
        </div>
      </Container>
    </>
  );
};
