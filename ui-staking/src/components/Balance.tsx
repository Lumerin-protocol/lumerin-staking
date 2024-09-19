import React from "react";
import { decimalsETH, decimalsLMR, decimalsMOR, formatUnits } from "../lib/units.ts";
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
