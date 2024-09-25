import { expect } from "chai";
import { InvalidNumberFormatError, parseDecimal, TooManyDecimalsError } from "./decimal.ts";

describe("decimal - parseDecimal", () => {
  (
    [
      ["0.001", 3, 1n],
      ["0.0001", 3, new TooManyDecimalsError("")],
      ["1.001", 3, 1001n],
      ["1.000", 3, 1000n],
      ["1", 3, 1000n],
      ["1000", 3, 1_000_000n],
      [" 1", 3, 1000n],
      [" +1.+1", 3, new InvalidNumberFormatError("")],
    ] as const
  ).forEach(([value, decimals, expected]) => {
    it(`parseDecimal(${value}, ${decimals}) should return ${expected}`, () => {
      if (expected instanceof Error) {
        expect(() => parseDecimal(value, decimals)).to.throw(expected.message);
        return;
      }
      expect(parseDecimal(value, decimals)).to.be.eq(expected);
    });
  });
});
