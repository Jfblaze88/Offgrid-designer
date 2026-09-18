import React from "react";
import { fmt, INVERTER_EFF } from "@/lib/calc";

function Total({ label, value, hint, accent }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-display text-3xl md:text-4xl font-semibold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</span>
        <span className="text-sm text-muted-foreground">Wh</span>
      </div>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export default function LoadTotals({ summary: s }) {
  const acFromBattery = s.acWh / INVERTER_EFF;
  return (
    <div className="sticky bottom-4 rounded-2xl border border-border bg-card/95 backdrop-blur p-5 md:p-6 shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-5">
      <Total label="DC per day" value={fmt(s.dcWh)} hint="Straight from the battery" />
      <Total label="AC per day" value={fmt(acFromBattery)} hint={`${fmt(s.acWh)} Wh at the outlet ÷ 0.85 inverter`} />
      <Total label="Total per day" value={fmt(s.batteryWh)} hint={`${fmt(s.dailyAh, 1)} Ah at 12 V`} accent />
    </div>
  );
}