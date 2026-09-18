import { BATTERY, fmt } from "@/lib/calc";

export function partsList(project, s, d, runs) {
  const parts = [];
  const add = (item, qty, unit = "pcs") => qty > 0 && parts.push({ item, qty, unit });

  add(`12 V 100 Ah ${BATTERY[project.battery_type]?.label} battery`, Math.ceil(d.bankAhRounded / 100));
  add("Battery disconnect switch", 1);
  add("Battery monitor with shunt", 1);
  add("Bus bar (positive + negative pair)", 1);
  add("12 V DC fuse panel", s.dcW > 0 ? 1 : 0);
  add("100 W solar panel", Math.ceil(d.solarW / 100));
  add(`MPPT charge controller (≥ ${fmt(d.solarW / 12)} A)`, d.solarW > 0 ? 1 : 0);
  add(`${fmt(d.inverterW)} W pure sine inverter`, d.inverterW > 0 ? 1 : 0);
  add(`${d.chargerAmps} A DC-DC charger`, d.chargerAmps > 0 ? 1 : 0);

  const wire = {};
  const fuses = {};
  for (const r of runs) {
    if (r.wire) wire[r.wire.awg] = (wire[r.wire.awg] || 0) + r.length * 2 * 1.1;
    if (r.fuse) { const k = `${r.fuse} A ${r.fuseType}`; fuses[k] = (fuses[k] || 0) + 1; }
  }
  for (const [awg, m] of Object.entries(wire)) add(`${awg} AWG tinned copper cable (red + black)`, Math.ceil(m), "m");
  for (const [k, n] of Object.entries(fuses)) add(`${k} fuse + holder`, n);
  return parts;
}

export function installOrder(s, d) {
  const steps = [
    "Mount and secure the battery bank. Fit the main fuse and disconnect switch on the positive terminal — leave the switch off.",
    "Mount the bus bars and battery monitor shunt. The shunt goes on the battery negative; everything else lands on the bus bars.",
    "Run the battery → bus bar cables and crimp lugs on both ends.",
  ];
  if (s.dcW > 0) steps.push("Mount the DC fuse panel and run each appliance circuit from the panel to its appliance. Label every circuit.");
  if (d.inverterW > 0) steps.push("Mount the inverter close to the battery and run its fused positive and negative cables to the bus bars.");
  if (d.solarW > 0) steps.push("Mount the charge controller. Connect it to the battery side first, then plug in the solar array.");
  if (d.chargerAmps > 0) steps.push("Mount the DC-DC charger. Wire it to the battery side, then run the fused cable to the alternator / starter battery.");
  steps.push("Double-check polarity and torque on every lug, then connect the battery negative last and turn on the disconnect switch.");
  steps.push("Power up one circuit at a time and confirm voltage and current on the battery monitor.");
  return steps;
}