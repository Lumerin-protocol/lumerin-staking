import React from "react";
import { decimalsLMR, decimalsMOR, formatUnits } from "../lib/units.ts";
import "./Balance.css";

export const BalanceCurrency = (props: {
  value: bigint;
  decimals: bigint | number;
  currency: string;
}) => (
  <span title={`${Number(props.value) / 10 ** Number(props.decimals)} ${props.currency}`}>
    ≈ {formatUnits(props.value, props.decimals)} <span className="currency">{props.currency}</span>
  </span>
);

export const BalanceMOR = (props: { value: bigint }) => (
  <BalanceCurrency value={props.value} currency="MOR" decimals={decimalsMOR} />
);

export const BalanceLMR = (props: { value: bigint }) => (
  <BalanceCurrency value={props.value} currency="LMR" decimals={decimalsLMR} />
);
