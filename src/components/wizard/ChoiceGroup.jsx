import React from "react";
import { cn } from "@/lib/utils";

export default function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2.5">{label}</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {options.map((o) => {
          const active = o.value === value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-xl border px-3.5 py-3 text-left transition-all",
                active ? "border-primary bg-primary/10 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]" : "border-border bg-card/40 hover:border-foreground/30"
              )}
            >
              {Icon && <Icon className={cn("h-4 w-4 mb-2", active ? "text-primary" : "text-muted-foreground")} />}
              <div className="text-sm font-medium">{o.label}</div>
              {o.sub && <div className="text-xs text-muted-foreground mt-0.5">{o.sub}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}