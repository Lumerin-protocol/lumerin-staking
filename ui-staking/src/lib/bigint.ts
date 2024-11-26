export function max(...args: bigint[]): bigint {
  return args.reduce((a, b) => (a > b ? a : b), BigInt(0));
}
