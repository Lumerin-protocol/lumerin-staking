import { expect } from "chai";
import { formatInt, formatUnits } from "./units.ts";

const decimals = 18n;
const d = 10n ** decimals; // decimal multiplier
const dt = 10n ** (decimals - 3n); // decimal multiplier /1000 for convenience
const dm = 10n ** (decimals - 6n); // decimal multiplier /1000000 for convenience
const table = [
  [1000n * dt, "1.00"],
  [1500n * dt, "1.50"],
  [1999n * dt, "2.00"],
  [1000999n * dm, "1.00"],
  [1200123n * dt, "1,200"],
  [1200560n * dt, "1,201"],
  [1000000n * d, "1,000,000"],
  [0n, "0"],
  [1n * dm, "< 0.01"],
  [123n * dt, "0.12"],
  [60n * d, "60.00"],
  [1n * dm, "< 0.01"],
] as const;

describe("unit tests", () => {
  for (const [input, expected] of table) {
    it(`should format ${input} as ${expected}`, () => {
      expect(formatUnits(input, decimals)).to.equal(expected);
    });
  }
});

describe("formatIntWithMetricMultiplier test", function () {
  (
    [
      [0n, "0"],
      [1n, "1"],
      [999n, "999"],
      [1000n, "1 k"],
      [1500n, "1.5 k"],
      [1510n, "1.51 k"],
      [1515n, "1.52 k"],
      [1999n, "2 k"],
      [1000000n, "1 M"],
      [1000999n, "1 M"],
      [1200123n, "1.2 M"],
      [1200560n, "1.2 M"],
      [1000000000n, "1,000 M"],
    ] as const
  ).forEach(([input, expected]) => {
    it(`should format ${input} as ${expected}`, () => {
      expect(formatInt(input)).to.equal(expected);
    });
  });
});
