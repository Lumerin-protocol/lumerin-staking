export const decimalsETH = 18n;
export const decimalsMOR = 18n;
export const decimalsLMR = 8n;

function getSeparators() {
  const data = new Intl.NumberFormat().formatToParts(1000.1);
  let thousand = "",
    decimal = ".";
  for (const part of data) {
    if (part.type === "group") {
      thousand = part.value;
    } else if (part.type === "decimal") {
      decimal = part.value;
    }
  }
  return { thousand, decimal };
}

const separators = getSeparators();

export function formatETH(num: bigint): string {
  return `${formatUnits(num, decimalsETH)} ETH`;
}

export function formatMOR(num: bigint): string {
  return `${formatUnits(num, decimalsMOR)} MOR`;
}

export function formatLMR(num: bigint): string {
  return `${formatUnits(num, decimalsLMR)} LMR`;
}

export function formatIntStr(integer: string | bigint) {
  let res = typeof integer === "string" ? integer : integer.toString();
  for (let i = res.length - 3; i > 0; i -= 3) {
    res = `${res.slice(0, i)}${separators.thousand}${res.slice(i)}`;
  }
  return res;
}

export function formatInt(num: bigint): string {
  const { value, unit } = formatIntParts(num);
  return `${value}${unit ? ` ${unit}` : ""}`;
}

export function formatIntParts(num: bigint): { value: string; unit: string; multiplier: bigint } {
  const numStr = num.toString();
  const numLength = numStr.length;
  if (numLength < 4) {
    return { value: numStr, unit: "", multiplier: 1n };
  }
  if (numLength < 7) {
    return { value: formatUnits(num, 3, true), unit: "k", multiplier: 10n ** 3n };
  }
  if (numLength < 10) {
    return { value: formatUnits(num, 6, true), unit: "M", multiplier: 10n ** 6n };
  }
  if (numLength < 13) {
    return { value: formatUnits(num, 9, true), unit: "B", multiplier: 10n ** 9n };
  }
  return { value: formatUnits(num, 12, true), unit: "T", multiplier: 10n ** 12n };
}

const significantDigits = 3;
const decimalDigits = 2n;

export function formatUnits(
  amount: bigint,
  decimals: bigint | number,
  trimDecimalZeros = false
): string {
  const decimalsBigInt = typeof decimals === "bigint" ? decimals : BigInt(Math.floor(decimals));
  if (amount === 0n) {
    return "0";
  }
  const minAmount = 1n * 10n ** (decimalsBigInt - decimalDigits);

  if (amount > 0n && amount < minAmount) {
    return "< 0.01";
  }
  const amountRounded =
    BigInt(
      Math.round((Number(amount) / Number(10n ** decimalsBigInt)) * Number(10n ** decimalDigits))
    ) *
    10n ** (decimalsBigInt - decimalDigits);
  return formatUnitsV2(amountRounded, Number(decimalsBigInt), trimDecimalZeros);
}

export function formatUnitsV2(value: bigint, decimals: number, trimDecimalZeros = false): string {
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
    fraction = fraction.slice(0, Number(decimalDigits));
  } else {
    const rounded = BigInt(Math.round(Number(value) / 10 ** decimals)) * 10n ** BigInt(decimals);
    if (rounded !== value) {
      return formatUnits(rounded, BigInt(decimals));
    }
    fraction = "";
  }

  if (trimDecimalZeros) {
    fraction = fraction.replace(/(0+)$/, "");
  }

  // split the integer part into groups of 3 digits
  for (let i = integer.length - 3; i > 0; i -= 3) {
    integer = `${integer.slice(0, i)}${separators.thousand}${integer.slice(i)}`;
  }
  return `${negative ? "-" : ""}${integer || "0"}${
    fraction ? `${separators.decimal}${fraction}` : ""
  }`;
}
