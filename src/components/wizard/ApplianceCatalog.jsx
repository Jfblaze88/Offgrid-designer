import React from "react";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApplianceCatalog({ catalog, selectedIds, onAdd }) {
  const groups = catalog.reduce((acc, a) => {
    (acc[a.category || "Other"] ||= []).push(a);
    return acc;
  }, {});
  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([cat, items]) => (
        <div key={cat}>
          <h4 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2.5">{cat}</h4>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-1.5">
            {items.map((a) => {
              const added = selectedIds.has(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => !added && onAdd(a)}
                  disabled={added}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all",
                    added ? "border-primary/30 bg-primary/5 text-muted-foreground" : "border-border bg-card/40 hover:border-foreground/30 hover:bg-card"
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{a.name}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {a.watts} W · {a.power_type} · ~{a.hours_per_day} h/day
                    </div>
                  </div>
                  <span className={cn("ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", added ? "text-primary" : "bg-muted text-foreground")}>
                    {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}