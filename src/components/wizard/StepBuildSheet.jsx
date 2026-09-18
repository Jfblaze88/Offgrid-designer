import React from "react";
import { Printer } from "lucide-react";
import BigStat from "./BigStat";
import PartsList from "./PartsList";
import InstallOrder from "./InstallOrder";
import SystemDiagram from "./SystemDiagram";
import SafetyDisclaimer from "./SafetyDisclaimer";
import { BATTERY, VEHICLES, loadSummary, systemDesign, wiringPlan, fmt } from "@/lib/calc";
import { partsList, installOrder } from "@/lib/buildSheet";

function Sheet({ title, children }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <h3 className="px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">{title}</h3>
      {children}
    </section>
  );
}

export default function StepBuildSheet({ project, wires, fuses }) {
  const s = loadSummary(project.loads);
  const d = systemDesign(project, s);
  const runs = wiringPlan(project, wires, fuses);
  const parts = partsList(project, s, d, runs);
  const steps = installOrder(s, d);

  return (
    <div className="space-y-8 print-area">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{project.name}</h2>
          <p className="mt-2 text-muted-foreground">{VEHICLES[project.vehicle_type]} · {BATTERY[project.battery_type]?.label} · {project.days_autonomy} days autonomy</p>
        </div>
        <button onClick={() => window.print()} className="no-print inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
          <Printer className="h-4 w-4" /> Print build sheet
        </button>
      </header>

      <SafetyDisclaimer />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigStat label="Daily energy" value={fmt(s.batteryWh)} unit="Wh" />
        <BigStat label="Battery bank" value={fmt(d.bankAhRounded)} unit="Ah" accent />
        <BigStat label="Solar" value={fmt(d.solarW)} unit="W" />
        <BigStat label="Inverter" value={d.inverterW ? fmt(d.inverterW) : "—"} unit={d.inverterW ? "W" : ""} />
      </div>

      <Sheet title="System diagram">
        <SystemDiagram project={project} s={s} d={d} runs={runs} />
      </Sheet>

      <Sheet title={`Loads · ${(project.loads || []).length}`}>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground"><tr className="border-b border-border">
            <th className="text-left font-medium px-5 py-2">Appliance</th><th className="text-right font-medium px-3 py-2">Qty</th><th className="text-right font-medium px-3 py-2">W</th><th className="text-right font-medium px-3 py-2">h/day</th><th className="text-right font-medium px-5 py-2">Wh/day</th>
          </tr></thead>
          <tbody className="tabular-nums">
            {(project.loads || []).map((l) => (
              <tr key={l.appliance_id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-2">{l.name} <span className="text-xs text-muted-foreground">{l.power_type}</span></td>
                <td className="text-right px-3 py-2">{l.quantity || 1}</td><td className="text-right px-3 py-2">{l.watts}</td><td className="text-right px-3 py-2">{l.hours_per_day}</td>
                <td className="text-right px-5 py-2 font-medium">{fmt(l.watts * l.hours_per_day * (l.quantity || 1))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>

      <Sheet title="Wiring">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground"><tr className="border-b border-border">
            <th className="text-left font-medium px-5 py-2">Run</th><th className="text-right font-medium px-3 py-2">Amps</th><th className="text-right font-medium px-3 py-2">Length</th><th className="text-right font-medium px-3 py-2">AWG</th><th className="text-right font-medium px-3 py-2">Drop</th><th className="text-right font-medium px-3 py-2">Fuse</th><th className="text-left font-medium px-5 py-2">Fuse type</th>
          </tr></thead>
          <tbody className="tabular-nums">
            {runs.map((r) => (
              <tr key={r.key} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-2">{r.label}</td><td className="text-right px-3 py-2">{fmt(r.amps, 1)}</td><td className="text-right px-3 py-2">{r.length} m</td>
                <td className="text-right px-3 py-2 font-medium text-primary">{r.wire?.awg}</td><td className="text-right px-3 py-2">{fmt(r.dropPct, 1)}%</td><td className="text-right px-3 py-2 font-medium">{r.fuse} A</td><td className="px-5 py-2 text-muted-foreground">{r.fuseType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>

      <Sheet title={`Parts list · ${parts.length} items`}>
        <PartsList parts={parts} />
      </Sheet>

      <Sheet title="Install order">
        <InstallOrder steps={steps} />
      </Sheet>
    </div>
  );
}