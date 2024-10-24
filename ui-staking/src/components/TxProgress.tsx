import { Link } from "react-router-dom";
import type { Chain } from "wagmi/chains";
import { getTxURL } from "../helpers/indexer.ts";
import { Check } from "../icons/Check.tsx";
import { Spinner } from "../icons/Spinner.tsx";
import { ErrorIcon } from "../icons/Error.tsx";
import "./TxProgress.css";

interface Props {
  isTransacting: boolean;
  txHash?: `0x${string}` | null;
  action?: string;
  error?: string | null | unknown;
}

export function TxProgress(props: Props, chain: Chain) {
  const { isTransacting, error, txHash } = props;
  const isSuccess = !isTransacting && !error && !!txHash;
  const isError = !!error;

  return (
    <div className="tx-progress">
      {isTransacting && (
        <div className="progress pending">
          <div className="icon">
            <Spinner className="tx-icon" />
          </div>
          <div className="title">Please confirm transaction in your wallet</div>
        </div>
      )}
      {isSuccess && (
        <div className="progress success">
          <div className="icon">
            <Check fill="#fff" className="tx-icon" />
          </div>
          <div className="title">Transaction succesfull</div>
          {props.action && <div className="action">{props.action}</div>}
          <div className="url">
            <Link to={getTxURL(txHash, chain) || ""} target="_blank">
              View on explorer
            </Link>
          </div>
        </div>
      )}
      {isError && (
        <div className="progress error">
          <div className="icon">
            <ErrorIcon fill="#cc1111" className="tx-icon" />
          </div>
          <div className="title">Transaction error</div>
          <div className="action">{String(error)}</div>
          {txHash && (
            <div className="url">
              <Link to={getTxURL(txHash, chain) || ""} target="_blank">
                View on explorer
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
