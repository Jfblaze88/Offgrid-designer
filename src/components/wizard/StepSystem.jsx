import React from "react";
import { Car, Truck, Ship, Home } from "lucide-react";
import ChoiceGroup from "./ChoiceGroup";
import SliderField from "./SliderField";
import ResultCard from "./ResultCard";
import { BATTERY, loadSummary, systemDesign, fmt } from "@/lib/calc";

const VEHICLE_OPTS = [
  { value: "camper_van", label: "Camper van", icon: Car },
  { value: "rv", label: "RV", icon: Truck },
  { value: "boat", label: "Boat", icon: Ship },
  { value: "tiny_house", label: "Tiny house", icon: Home },
];
const BATTERY_OPTS = Object.entries(BATTERY).map(([value, b]) => ({ value, label: b.label, sub: b.sub }));

export default function StepSystem({ project, update }) {
  const s = loadSummary(project.loads);
  const d = systemDesign(project, s);
  const o = project.overrides || {};
  const setOverride = (key, v) => update({ overrides: { ...o, [key]: v ?? undefined } });
  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Size the system</h2>
        <p className="mt-2 text-muted-foreground max-w-xl">Tell us about your setup and how you'll recharge. The recommendations update live.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <ResultCard label="Battery bank" value={fmt(d.bankAhRounded)} unit="Ah" overridden={o.bank_ah != null} onOverride={(v) => setOverride("bank_ah", v)}
          explanation={`${fmt(s.dailyAh, 1)} Ah/day × ${project.days_autonomy} days ÷ ${Math.round(d.dod * 100)}% usable = ${fmt(d.bankAh)} Ah, rounded up to the next 50 Ah (${fmt(d.bankWh)} Wh).`} />
        <ResultCard label="Solar array" value={fmt(d.solarW)} unit="W" overridden={o.solar_w != null} onOverride={(v) => setOverride("solar_w", v)}
          explanation={project.sun_hours > 0 ? `${fmt(s.batteryWh)} Wh/day ÷ ${project.sun_hours} peak sun hours ÷ 75% real-world panel efficiency.` : "Set some sun hours to size a solar array."} />
        <ResultCard label="Inverter" value={fmt(d.inverterW)} unit="W" overridden={o.inverter_w != null} onOverride={(v) => setOverride("inverter_w", v)}
          explanation={s.acW > 0 ? `Covers the larger of AC peak ${fmt(s.acW)} W × 1.25 or surge ${fmt(s.acSurge)} W, rounded up to a standard size.` : "No AC appliances, so no inverter is needed."} />
        <ResultCard label="DC-DC charger" value={fmt(d.chargerAmps)} unit="A" overridden={o.charger_a != null} onOverride={(v) => setOverride("charger_a", v)}
          explanation={project.drive_hours > 0 ? `${fmt(d.shortfallWh)} Wh/day left after solar ÷ 13.8 V ÷ ${project.drive_hours} h of driving = ${fmt(d.chargerAmpsRaw, 1)} A, rounded up to a standard size.` : "Set some driving hours to size an alternator charger."} />
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2.5">Project name</div>
          <input
            value={project.name || ""}
            onChange={(e) => update({ name: e.target.value })}
            className="w-full sm:max-w-md rounded-xl border border-border bg-card/60 px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <ChoiceGroup label="Vehicle" options={VEHICLE_OPTS} value={project.vehicle_type} onChange={(v) => update({ vehicle_type: v })} />
        <ChoiceGroup label="Battery chemistry" options={BATTERY_OPTS} value={project.battery_type} onChange={(v) => update({ battery_type: v })} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SliderField label="Days of autonomy" hint="Days without any charging" value={project.days_autonomy ?? 2} unit="days" min={1} max={7} step={0.5} onChange={(v) => update({ days_autonomy: v })} />
          <SliderField label="Peak sun hours" hint="Typical effective sun per day" value={project.sun_hours ?? 4} unit="h" min={0} max={8} step={0.5} onChange={(v) => update({ sun_hours: v })} />
          <SliderField label="Driving per day" hint="Engine running for DC-DC charging" value={project.drive_hours ?? 1} unit="h" min={0} max={8} step={0.5} onChange={(v) => update({ drive_hours: v })} />
        </div>
      </div>
    </div>
  );
}