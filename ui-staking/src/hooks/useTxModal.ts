import { useState } from "react";
import type { WriteContractErrorType } from "viem";
import { usePublicClient } from "wagmi";

export type TxResult = { hash: `0x${string}`; value: bigint };
type TxResultBase = { hash: `0x${string}` };

export interface StartProps<A, T> {
  approveCall?: () => Promise<A>;
  txCall: () => Promise<T>;
  onSuccess?: () => Promise<void>;
}

type Stage = "inactive" | "approving" | "approve-error" | "transacting" | "tx-error" | "done";

export const useTxModal = <
  A extends TxResultBase = TxResult,
  T extends TxResultBase = TxResult
>() => {
  const [stage, setStage] = useState<Stage>("inactive");
  const [approveTxResult, setApproveTxResult] = useState<A | null>(null);
  const [txResult, setTxResult] = useState<T | null>(null);
  const [approveError, setApproveError] = useState<WriteContractErrorType | null>(null);
  const [txError, setTxError] = useState<WriteContractErrorType | null>(null);
  const pc = usePublicClient();

  async function start(props: StartProps<A, T>) {
    setStage("inactive");
    setApproveTxResult(null);
    setApproveError(null);

    if (props.approveCall) {
      setStage("approving");
      try {
        const approveTx = await props.approveCall();
        setApproveTxResult(approveTx);
      } catch (e) {
        setStage("approve-error");
        setApproveError(e as WriteContractErrorType);
        return;
      }
    }

    setStage("transacting");
    try {
      const tx = await props.txCall();
      setTxResult(tx);
    } catch (e) {
      setStage("tx-error");
      setTxError(e as WriteContractErrorType);
    }

    setStage("done");
    await props.onSuccess?.();
  }

  function reset() {
    setStage("inactive");
    setApproveTxResult(null);
    setTxResult(null);
    setApproveError(null);
    setTxError(null);
  }

  return {
    stage,
    approveTxHash: approveTxResult,
    txHash: txResult,
    approveError,
    txError,
    start,
    reset,
    isVisible: stage !== "inactive",
    isApproving: stage === "approving",
    isApproveError: stage === "approve-error",
    isApproveSuccess: stage === "transacting" || stage === "tx-error" || stage === "done",
    isTransacting: stage === "transacting",
    isTransactionSuccess: stage === "done",
    isTransactionError: stage === "tx-error",
  };
};
