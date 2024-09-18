import { useAccount, useDisconnect } from "wagmi";
import { Container } from "../../components/Container.tsx";
import homeElement from "../../images/home-element.webp";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../../components/Button.tsx";
import { useWeb3Modal, useWeb3ModalEvents } from "@web3modal/wagmi/react";
import { Header } from "../../components/Header.tsx";
import { BalanceLMR, BalanceMOR } from "../../components/Balance.tsx";
import { useLanding } from "./useLanding.ts";
import "./Landing.css";
import { Arrow2 } from "../../icons/Arrow2.tsx";

export const Landing = () => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { open } = useWeb3Modal();
  const event = useWeb3ModalEvents();

  useEffect(() => {
    if (event.data.event === "CONNECT_SUCCESS") {
      navigate("/pools/0");
    }
  }, [event, navigate]);

  const { totalPools, availableRewardsMOR, tvlLMR } = useLanding();

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
              <Button className="button-primary" onClick={() => navigate("/pools/0")}>
                Stake LMR
              </Button>
              <Button onClick={() => disconnect()}>Disconnect</Button>
            </>
          ) : (
            <Button className="button-primary" onClick={() => open({ view: "Connect" })}>
              Connect Wallet <Arrow2 />
            </Button>
          )}
        </div>
        <div className="cta-stats">
          <div className="cta-stat">
            <p>{totalPools.isSuccess ? String(totalPools.data) : "Error"}</p>
            <h3>Total Pools</h3>
          </div>
          <div className="cta-stat">
            <p>
              {availableRewardsMOR.isSuccess ? (
                <BalanceMOR value={availableRewardsMOR.data} />
              ) : (
                "Error"
              )}
            </p>
            <h3>Available Rewards</h3>
          </div>
          <div className="cta-stat">
            <p>{tvlLMR.isSuccess ? <BalanceLMR value={tvlLMR.data} /> : "Error"}</p>
            <h3>Total Value Locked</h3>
          </div>
        </div>
      </Container>
    </>
  );
};
