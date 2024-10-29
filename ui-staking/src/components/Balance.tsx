import React from "react";
import {
  decimalsETH,
  decimalsLMR,
  decimalsMOR,
  formatIntParts,
  formatIntStr,
  formatUnits,
} from "../lib/units.ts";
import "./Balance.css";

export const BalanceCurrency = (props: {
  value: bigint;
  decimals: bigint | number;
  currency: string;
}) => (
  <span
    className="balance token-balance"
    title={`${Number(props.value) / 10 ** Number(props.decimals)} ${props.currency}`}
  >
    {formatUnits(props.value, props.decimals)} <span className="currency">{props.currency}</span>
  </span>
);

export const BalanceMOR = (props: { value: bigint }) => (
  <BalanceCurrency value={props.value} currency="MOR" decimals={decimalsMOR} />
);

export const BalanceLMR = (props: { value: bigint }) => (
  <BalanceCurrency value={props.value} currency="LMR" decimals={decimalsLMR} />
);

export const BalanceETH = (props: { value: bigint }) => (
  <BalanceCurrency value={props.value} currency="ETH" decimals={decimalsETH} />
);

export const BalanceUSD = (props: { value: number }) => {
  return (
    <span className="balance fiat-balance" title={`$${props.value}`}>
      <span className="currency">$</span>
      {props.value.toFixed(2)}
    </span>
  );
};

export const BalanceValue = (props: { value: bigint }) => {
  const { value, unit } = formatIntParts(props.value);
  return (
    <span className="balance token-balance" title={formatIntStr(props.value)}>
      {value} <span className="currency">{unit}</span>
    </span>
  );
};

export const PercentAPY = (props: { fraction: number }) => {
  let { fraction } = props;
  const overflow = fraction > 10; // > 1000%
  if (overflow) {
    fraction = 10;
  }

  return (
    <span className="balance percent" title={`${props.fraction * 100}%`}>
      {overflow ? "> " : ""}
      {formatUnits(BigInt(Math.round(fraction * 10000)), 2, true)}{" "}
      <span className="currency unit">%</span>
    </span>
  );
};

export const PercentAPYRange = (props: { min: number; max: number }) => {
  const enDash = "–";

  let { min, max } = props;
  const overflow = min > 10; // > 1000%
  if (overflow) {
    min = 10;
    return (
      <span className="balance percent" title={`${min * 100}%`}>
        {"> "}
        {formatUnits(BigInt(Math.round(min * 10000)), 2, true)}
        <span className="currency unit">%</span>
      </span>
    );
  }

  return (
    <span className="balance percent" title={`${min * 100}% - ${max * 100}%`}>
      {formatUnits(BigInt(Math.round(min * 10000)), 2, true)}
      <span className="currency unit">%</span>
      <span className="dash">{enDash}</span>
      {formatUnits(BigInt(Math.round(max * 10000)), 2, true)}
      <span className="currency unit">%</span>
    </span>
  );
};

export const DateTime = (props: { epochSeconds: bigint }) => {
  const date = new Date(Number(props.epochSeconds) * 1000);
  const dateFmt = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const dateStrFull = date.toLocaleString("en");

  const dateParts = dateFmt.formatToParts(date);

  return (
    <span className="value datetime" title={dateStrFull}>
      {dateParts.map((part, i) => (
        <span key={i} className={part.type}>
          {part.value}
        </span>
      ))}
    </span>
  );
};
