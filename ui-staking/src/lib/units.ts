export const decimalsETH = 18n;
export const decimalsMOR = 18n;
export const decimalsLMR = 8n;

export function formatPercent(num: number): string {
  return `${(num * 100).toFixed(2)} %`;
}

export function formatETH(num: bigint): string {
  return `${formatUnits(num, decimalsETH)} ETH`;
}

export function formatMOR(num: bigint): string {
  return `${formatUnits(num, decimalsMOR)} MOR`;
}

export function formatLMR(num: bigint): string {
  return `${formatUnits(num, decimalsLMR)} LMR`;
}

const thousandsSeparator = " ";
const significantDigits = 3;

export function formatUnits(amount: bigint, decimals: bigint | number): string {
  const decimalsBigInt = typeof decimals === "bigint" ? decimals : BigInt(Math.floor(decimals));
  const decimal3 =
    BigInt(Math.round((Number(amount) / Number(10n ** decimalsBigInt)) * 1000)) *
    10n ** decimalsBigInt;
  return formatUnitsV2(decimal3, Number(decimalsBigInt + 3n));
}

export function formatUnitsV2(value: bigint, decimals: number) {
  let display = value.toString();

  const negative = display.startsWith("-");
  if (negative) display = display.slice(1);

  display = display.padStart(decimals, "0");

  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals),
  ];
  const integerSignificantDigits = integer.length;
  if (integerSignificantDigits < significantDigits) {
    fraction = fraction.slice(0, significantDigits);
  } else {
    const rounded = BigInt(Math.round(Number(value) / 10 ** decimals)) * 10n ** BigInt(decimals);
    if (rounded !== value) {
      return formatUnits(rounded, BigInt(decimals));
    }
    fraction = "";
  }
  // hide fraction if it's all zeros
  if (integer === "" && fraction === "000") {
    fraction = "";
  }
  // fraction = fraction.replace(/(0+)$/, '')
  // split the integer part into groups of 3 digits
  for (let i = integer.length - 3; i > 0; i -= 3) {
    integer = `${integer.slice(0, i)}${thousandsSeparator}${integer.slice(i)}`;
  }
  return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}
