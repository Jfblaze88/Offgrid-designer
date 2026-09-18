import React from "react";
import { cn } from "@/lib/utils";

export default function BigStat({ label, value, unit, hint, accent, className }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card/60 p-5 md:p-6 flex flex-col gap-2", className)}>
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={cn("font-display text-4xl md:text-5xl font-semibold tabular-nums tracking-tight", accent ? "text-primary" : "text-foreground")}>
          {value}
        </span>
        {unit && <span className="text-base md:text-lg text-muted-foreground font-medium">{unit}</span>}
      </div>
      {hint && <span className="text-xs text-muted-foreground leading-relaxed">{hint}</span>}
    </div>
  );
}