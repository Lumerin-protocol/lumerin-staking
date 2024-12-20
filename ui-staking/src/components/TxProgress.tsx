import { Link } from "react-router-dom";
import type { Chain } from "wagmi/chains";
import { getTxURL } from "../helpers/indexer.ts";
import { Check } from "../icons/Check.tsx";
import { Spinner } from "../icons/Spinner.tsx";
import { ErrorIcon } from "../icons/Error.tsx";
import "./TxProgress.css";

interface Props {
  isTransacting: boolean;
  skippedMessage?: string;
  txHash?: `0x${string}` | null;
  action?: string;
  error?: string | null | unknown;
  chain: Chain | undefined;
}

export function TxProgress(props: Props) {
  const { isTransacting, skippedMessage, error, txHash } = props;
  const isSkipped = !!skippedMessage;
  const isSuccess = !isTransacting && !error && !!txHash && !isSkipped;
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
            <Link to={getTxURL(txHash, props.chain) || ""} target="_blank">
              View on explorer
            </Link>
          </div>
        </div>
      )}
      {isSkipped && (
        <div className="progress success">
          <div className="icon">
            <Check fill="#fff" className="tx-icon" />
          </div>
          <div className="title">Transaction skipped</div>
          {props.action && <div className="action">{props.skippedMessage}</div>}
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
              <Link to={getTxURL(txHash, props.chain) || ""} target="_blank">
                View on explorer
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
