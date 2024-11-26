import prettyMs from "pretty-ms";

export function formatDate(num: bigint | number): string {
  return new Date(Number(num) * 1000).toLocaleString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDuration(
  seconds: bigint,
  opts?: { verbose?: boolean; compact?: boolean }
): string {
  if (seconds === 0n) {
    return `0 ${opts?.verbose ? "seconds" : "s"}`;
  }
  const verbose = opts?.verbose || false;
  const compact = opts?.compact || false;
  return prettyMs(Number(seconds) * 1000, { compact, verbose });
}
