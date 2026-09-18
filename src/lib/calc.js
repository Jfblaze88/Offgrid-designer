export const SYSTEM_V = 12;
export const INVERTER_EFF = 0.85;

export const BATTERY = {
  lifepo4: { label: "LiFePO4", sub: "Lithium · 80% usable", dod: 0.8 },
  agm: { label: "AGM", sub: "Sealed lead · 50% usable", dod: 0.5 },
  lead_acid: { label: "Flooded", sub: "Lead-acid · 50% usable", dod: 0.5 },
};

export const VEHICLES = {
  camper_van: "Camper van",
  rv: "RV",
  boat: "Boat",
  tiny_house: "Tiny house",
};

const INVERTER_SIZES = [300, 600, 1000, 1500, 2000, 3000, 4000, 5000];
const CHARGER_SIZES = [18, 30, 40, 50, 60];

export function loadSummary(loads = []) {
  let dcWh = 0, acWh = 0, dcW = 0, acW = 0, acSurge = 0;
  for (const l of loads) {
    const q = l.quantity || 1;
    const wh = (l.watts || 0) * (l.hours_per_day || 0) * q;
    if (l.power_type === "AC") {
      acWh += wh;
      acW += l.watts * q;
      acSurge = Math.max(acSurge, (l.surge_watts || l.watts) * q);
    } else {
      dcWh += wh;
      dcW += l.watts * q;
    }
  }
  const batteryWh = dcWh + acWh / INVERTER_EFF;
  return { dcWh, acWh, dcW, acW, acSurge, batteryWh, dailyAh: batteryWh / SYSTEM_V };
}

export function systemDesign(project, s) {
  const dod = BATTERY[project.battery_type]?.dod ?? 0.8;
  const days = project.days_autonomy || 2;
  const bankAh = (s.dailyAh * days) / dod;
  const bankAhRounded = Math.ceil(bankAh / 50) * 50;
  const inverterW = s.acW > 0
    ? INVERTER_SIZES.find((x) => x >= Math.max(s.acW * 1.25, s.acSurge)) ?? INVERTER_SIZES.at(-1)
    : 0;
  const sun = project.sun_hours || 0;
  const solarW = sun > 0 && s.batteryWh > 0 ? Math.ceil(s.batteryWh / sun / 0.75 / 10) * 10 : 0;
  const drive = project.drive_hours || 0;
  const o = project.overrides || {};
  const solarFinal = o.solar_w ?? solarW;
  const shortfall = Math.max(0, s.batteryWh - solarFinal * sun * 0.75);
  const chargerAmpsRaw = drive > 0 ? shortfall / 13.8 / drive : 0;
  const chargerAmps = chargerAmpsRaw > 0
    ? CHARGER_SIZES.find((x) => x >= chargerAmpsRaw) ?? CHARGER_SIZES.at(-1)
    : 0;
  const finalBank = o.bank_ah ?? bankAhRounded;
  return {
    dod, bankAh, chargerAmpsRaw, shortfallWh: shortfall,
    bankAhRounded: finalBank,
    bankWh: finalBank * SYSTEM_V,
    inverterW: o.inverter_w ?? inverterW,
    solarW: o.solar_w ?? solarW,
    chargerAmps: o.charger_a ?? chargerAmps,
    calc: { bankAhRounded, inverterW, solarW, chargerAmps },
  };
}

export const RUNS = [
  { key: "inverter", label: "Battery → Inverter", length: 1.5 },
  { key: "dc_panel", label: "Battery → Bus bar", length: 2 },
  { key: "solar", label: "Solar array → Charge controller", length: 5 },
  { key: "controller", label: "Charge controller → Battery", length: 1.5 },
  { key: "alternator", label: "Alternator → DC-DC charger", length: 4 },
  { key: "dcdc", label: "DC-DC charger → Battery", length: 3 },
];
const LOAD_RUN_LENGTH = 3;

export function runCurrents(s, d) {
  return {
    inverter: d.inverterW / SYSTEM_V / INVERTER_EFF,
    dc_panel: s.dcW / SYSTEM_V,
    solar: d.solarW / 18,
    controller: d.solarW / SYSTEM_V,
    alternator: d.chargerAmps * 1.1,
    dcdc: d.chargerAmps,
  };
}

export function fuseType(amps, key, batteryType) {
  if ((key === "dc_panel" || key === "inverter") && batteryType === "lifepo4") return "Class T";
  if (key === "solar") return "Inline MC4";
  if (amps <= 30) return "Blade (ATO)";
  if (amps <= 60) return "Maxi blade";
  if (amps <= 300) return "MRBF / ANL";
  return "Class T";
}

export function pickWire(wires, amps, lengthM) {
  const sorted = [...wires].sort((a, b) => a.ampacity - b.ampacity);
  const maxDrop = SYSTEM_V * 0.03;
  for (const w of sorted) {
    const drop = amps * w.ohms_per_meter * lengthM * 2;
    if (w.ampacity >= amps * 1.25 && drop <= maxDrop) return { wire: w, drop, over: false };
  }
  const w = sorted.at(-1);
  return w ? { wire: w, drop: amps * w.ohms_per_meter * lengthM * 2, over: true } : null;
}

export function pickFuse(fuses, amps, ampacity) {
  const sorted = fuses.map((f) => f.amps).sort((a, b) => a - b);
  const fit = sorted.find((f) => f >= amps * 1.25 && f <= ampacity);
  return fit ?? [...sorted].reverse().find((f) => f <= ampacity) ?? sorted[0];
}

export function wiringPlan(project, wires, fuses) {
  const s = loadSummary(project.loads);
  const d = systemDesign(project, s);
  const amps = runCurrents(s, d);
  const system = RUNS.filter((r) => amps[r.key] > 0).map((r) => ({ ...r, amps: amps[r.key] }));
  const loads = (project.loads || [])
    .filter((l) => l.power_type !== "AC" && l.watts > 0)
    .map((l) => ({
      key: `load:${l.appliance_id}`,
      label: `Bus bar → ${l.name}${(l.quantity || 1) > 1 ? ` (×${l.quantity})` : ""}`,
      length: LOAD_RUN_LENGTH,
      amps: (l.watts * (l.quantity || 1)) / SYSTEM_V,
    }));
  return [...system, ...loads].map((r) => {
    const length = project.run_lengths?.[r.key] ?? r.length;
    const pick = pickWire(wires, r.amps, length);
    const fuse = pick ? pickFuse(fuses, r.amps, pick.wire.ampacity) : null;
    return {
      ...r,
      length,
      wire: pick?.wire,
      drop: pick?.drop ?? 0,
      dropPct: pick ? (pick.drop / SYSTEM_V) * 100 : 0,
      over: pick?.over ?? false,
      fuse,
      fuseType: fuse ? fuseType(fuse, r.key, project.battery_type) : null,
    };
  });
}

export const fmt = (n, digits = 0) =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : "—";