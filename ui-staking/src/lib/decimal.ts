export class InvalidNumberFormatError extends Error {
  constructor(message: string, opts?: ErrorOptions) {
    super("InvalidNumberFormatError");
    this.name = "InvalidNumberFormatError";
    this.cause = opts?.cause;
  }
}

export class TooManyDecimalsError extends Error {
  constructor(message: string, opts?: ErrorOptions) {
    super(message);
    this.name = "TooManyDecimalsError";
    this.cause = opts?.cause;
  }
}

export function parseDecimal(value: string, decimals: number): bigint {
  const parts = value.split(".");
  if (parts.length === 1) {
    return BigInt(value) * BigInt(10 ** decimals);
  }
  if (parts.length > 2) {
    throw new InvalidNumberFormatError("Number has multiple decimal points");
  }
  const [whole, fraction] = parts;
  if (fraction.length > decimals) {
    throw new TooManyDecimalsError("Number has too many decimals");
  }
  try {
    return BigInt(whole + fraction.padEnd(decimals, "0"));
  } catch (err) {
    throw new InvalidNumberFormatError("Cannot convert to BigInt", { cause: err });
  }
}
