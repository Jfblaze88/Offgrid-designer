import React from "react";
import WireTable from "./WireTable";
import { wiringPlan } from "@/lib/calc";

export default function StepWiring({ project, wires, fuses, update }) {
  const runs = wiringPlan(project, wires, fuses);
  const setLength = (key, v) => update({ run_lengths: { ...(project.run_lengths || {}), [key]: v } });
  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Wire it safely</h2>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Enter the one-way length of each cable run. Wire is sized for 125% of its current and a maximum 3% voltage drop over the round trip; the fuse protects the wire, not the device.
        </p>
      </header>
      {runs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Add some loads first — there's nothing to wire yet.
        </div>
      ) : (
        <WireTable runs={runs} onLength={setLength} />
      )}
      <p className="text-xs text-muted-foreground max-w-2xl">
        Based on tinned copper at 12 V with 105 °C insulation. Solar array current assumes ~18 V panel voltage. Always verify against local codes and manufacturer specs.
      </p>
    </div>
  );
}