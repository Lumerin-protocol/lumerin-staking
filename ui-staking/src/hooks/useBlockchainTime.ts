import { useStopwatch } from "react-timer-hook";
import { useBlock } from "wagmi";

// This hook returns the current blockchain time in seconds and increments it every second
export function useBlockchainTime(): bigint {
  const block = useBlock();
  const { totalSeconds } = useStopwatch({ autoStart: true });
  return block.isSuccess ? block.data.timestamp + BigInt(totalSeconds) : 0n;
}
