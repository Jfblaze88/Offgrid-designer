import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { fmt } from "@/lib/calc";

export default function LoadRow({ load, onChange, onRemove }) {
  const q = load.quantity || 1;
  const wh = load.watts * load.hours_per_day * q;
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3.5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{load.name}</div>
          <div className="text-xs text-muted-foreground tabular-nums">
            <span className={load.power_type === "AC" ? "text-primary" : ""}>{load.power_type}</span>
            {load.power_type === "AC" && " · ÷ 0.85 inverter"}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-xl font-semibold tabular-nums">{fmt(wh)}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Wh / day</div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          <button className="px-2.5 py-1.5 hover:bg-muted" onClick={() => onChange({ quantity: Math.max(1, q - 1) })}><Minus className="h-3.5 w-3.5" /></button>
          <span className="px-2 text-sm font-medium tabular-nums w-8 text-center">{q}×</span>
          <button className="px-2.5 py-1.5 hover:bg-muted" onClick={() => onChange({ quantity: q + 1 })}><Plus className="h-3.5 w-3.5" /></button>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="number" min="0" step="1"
            value={load.watts}
            onChange={(e) => onChange({ watts: Math.max(0, parseFloat(e.target.value) || 0) })}
            className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
          />
          W
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="number" min="0" max="24" step="0.5"
            value={load.hours_per_day}
            onChange={(e) => onChange({ hours_per_day: Math.min(24, Math.max(0, parseFloat(e.target.value) || 0)) })}
            className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
          />
          h / day
        </label>
        <button onClick={onRemove} className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-1.5" aria-label="Remove">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}