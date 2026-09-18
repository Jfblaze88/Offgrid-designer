import React from "react";
import { Slider } from "@/components/ui/slider";

export default function SliderField({ label, value, unit, min, max, step = 1, onChange, hint }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="font-display text-3xl font-semibold tabular-nums">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}