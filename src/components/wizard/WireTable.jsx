import React from "react";
import { AlertTriangle } from "lucide-react";
import { fmt } from "@/lib/calc";

const th = "px-3 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium";

export default function WireTable({ runs, onLength }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="border-b border-border">
            <th className={`${th} text-left pl-5`}>Run</th>
            <th className={`${th} text-right`}>Amps</th>
            <th className={`${th} text-right`}>Length (m)</th>
            <th className={`${th} text-right`}>AWG</th>
            <th className={`${th} text-right`}>Drop</th>
            <th className={`${th} text-right`}>Fuse</th>
            <th className={`${th} text-left pr-5`}>Fuse type</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {runs.map((r) => (
            <tr key={r.key} className="border-b border-border/60 last:border-0">
              <td className="px-3 pl-5 py-2.5 font-medium">
                {r.label}
                {r.over && <span className="ml-2 inline-flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="h-3 w-3" /> shorten run</span>}
              </td>
              <td className="px-3 py-2.5 text-right">{fmt(r.amps, 1)}</td>
              <td className="px-3 py-2.5 text-right">
                <input
                  type="number" min="0.5" max="50" step="0.5" value={r.length}
                  onChange={(e) => onLength(r.key, Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                  className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-right text-sm text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </td>
              <td className="px-3 py-2.5 text-right font-display text-xl font-semibold text-primary">{r.wire?.awg ?? "—"}</td>
              <td className={`px-3 py-2.5 text-right ${r.over ? "text-destructive" : "text-muted-foreground"}`}>{fmt(r.dropPct, 1)}%</td>
              <td className="px-3 py-2.5 text-right font-display text-xl font-semibold">{r.fuse ? `${r.fuse} A` : "—"}</td>
              <td className="px-3 pr-5 py-2.5 text-muted-foreground">{r.fuseType ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}