import React, { useState } from "react";
import { Pencil, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResultCard({ label, value, unit, explanation, overridden, onOverride }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const start = () => { setDraft(String(value ?? "")); setEditing(true); };
  const commit = () => { const n = parseFloat(draft); if (n >= 0) onOverride(n); setEditing(false); };

  return (
    <div className={cn("rounded-2xl border bg-card/60 p-5 md:p-6 flex flex-col gap-2", overridden ? "border-primary/50" : "border-border")}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{label}</span>
        {overridden && <span className="text-[10px] uppercase tracking-widest text-primary">Manual</span>}
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input autoFocus type="number" min="0" value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-display text-2xl font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={commit} className="rounded-lg bg-primary p-2.5 text-primary-foreground" aria-label="Save"><Check className="h-4 w-4" /></button>
        </div>
      ) : (
        <button onClick={start} className="group flex items-baseline gap-2 text-left" aria-label={`Edit ${label}`}>
          <span className="font-display text-4xl md:text-5xl font-semibold tabular-nums tracking-tight text-primary">{value}</span>
          <span className="text-base md:text-lg text-muted-foreground font-medium">{unit}</span>
          <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
        </button>
      )}
      <span className="text-xs text-muted-foreground leading-relaxed">{explanation}</span>
      {overridden && (
        <button onClick={() => onOverride(null)} className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline self-start">
          <RotateCcw className="h-3 w-3" /> Reset to calculated
        </button>
      )}
    </div>
  );
}