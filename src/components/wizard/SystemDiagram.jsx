import React from "react";
import { fmt } from "@/lib/calc";

const BOX_W = 150;
const BUS_X = 470;

function Box({ x, y, w = BOX_W, h = 54, title, sub }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" className="fill-card stroke-border" strokeWidth="1.5" />
      <text x={x + w / 2} y={y + (sub ? 22 : 31)} textAnchor="middle" className="fill-foreground text-[13px] font-medium">{title}</text>
      {sub && <text x={x + w / 2} y={y + 39} textAnchor="middle" className="fill-muted-foreground text-[11px]">{sub}</text>}
    </g>
  );
}

function Fuse({ x, y, amps }) {
  if (!amps) return null;
  return (
    <g>
      <rect x={x - 17} y={y - 10} width="34" height="20" rx="4" className="fill-background stroke-primary" strokeWidth="1.5" />
      <text x={x} y={y + 4} textAnchor="middle" className="fill-primary text-[10px] font-semibold">{amps}A</text>
    </g>
  );
}

function Link({ from, to, y, run, dir = "right", fuseAt }) {
  const x1 = dir === "right" ? from : to;
  const x2 = dir === "right" ? to : from;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} className="stroke-muted-foreground" strokeWidth="2" />
      {run?.wire && (
        <text x={(x1 + x2) / 2} y={y - 17} textAnchor="middle" className="fill-primary text-[11px] font-semibold">
          {run.wire.awg} AWG
        </text>
      )}
      {run?.fuse && <Fuse x={fuseAt ?? (x1 + x2) / 2 + 0} y={y} amps={run.fuse} />}
    </g>
  );
}

export default function SystemDiagram({ project, s, d, runs }) {
  const byKey = Object.fromEntries(runs.map((r) => [r.key, r]));
  const loadRuns = runs.filter((r) => r.key.startsWith("load:"));

  const rows = [];
  if (d.solarW > 0) rows.push("solar");
  if (d.chargerAmps > 0) rows.push("dcdc");
  const topH = rows.length * 100;

  let y = 40;
  const source = [];
  if (d.solarW > 0) {
    source.push(
      <g key="solar">
        <Box x={10} y={y} title={`${fmt(d.solarW)} W solar`} sub="panels in series" />
        <Link from={160} to={230} y={y + 27} run={byKey.solar} />
        <Box x={230} y={y} title="MPPT controller" sub={`≥ ${fmt(d.solarW / 12)} A`} />
        <Link from={380} to={BUS_X} y={y + 27} run={byKey.controller} fuseAt={436} />
      </g>
    );
    y += 100;
  }
  if (d.chargerAmps > 0) {
    source.push(
      <g key="dcdc">
        <Box x={10} y={y} title="Alternator" sub="starter battery" />
        <Link from={160} to={230} y={y + 27} run={byKey.alternator} />
        <Box x={230} y={y} title={`${d.chargerAmps} A DC-DC`} sub="charger" />
        <Link from={380} to={BUS_X} y={y + 27} run={byKey.dcdc} fuseAt={436} />
      </g>
    );
  }

  const batteryY = 40 + topH + 30;
  const inverterY = 40;
  const panelY = batteryY + 120;
  const loadsY = panelY + 110;
  const height = Math.max(loadsY + Math.max(loadRuns.length, 1) * 26 + 40, 420);

  return (
    <div className="overflow-x-auto px-4 py-5">
      <svg viewBox={`0 0 900 ${height}`} className="w-full min-w-[720px]" style={{ height: "auto" }}>
        {/* bus bars */}
        <rect x={BUS_X} y={30} width="18" height={height - 70} rx="5" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
        <text x={BUS_X + 9} y={20} textAnchor="middle" className="fill-muted-foreground text-[10px] tracking-[0.16em]">BUS BARS</text>

        {source}

        {/* battery bank */}
        <Box x={130} y={batteryY} w={250} h={62}
          title={`${fmt(d.bankAhRounded)} Ah battery bank`}
          sub={`12 V · ${fmt(d.bankWh)} Wh · main fuse + disconnect`} />
        <Link from={380} to={BUS_X} y={batteryY + 31} run={byKey.dc_panel} fuseAt={436} />

        {/* inverter */}
        {d.inverterW > 0 && (
          <g>
            <Link from={BUS_X + 18} to={620} y={inverterY + 27} run={byKey.inverter} fuseAt={BUS_X + 52} />
            <Box x={620} y={inverterY} w={230} h={54} title={`${fmt(d.inverterW)} W inverter`} sub={`AC loads · ${fmt(s.acW)} W running`} />
          </g>
        )}

        {/* dc fuse panel + appliance circuits */}
        {loadRuns.length > 0 && (
          <g>
            <Link from={BUS_X + 18} to={620} y={panelY + 27} run={byKey.dc_panel} fuseAt={BUS_X + 52} />
            <Box x={620} y={panelY} w={230} h={54} title="12 V DC fuse panel" sub={`${loadRuns.length} circuits`} />
            <line x1={735} y1={panelY + 54} x2={735} y2={loadsY - 10} className="stroke-muted-foreground" strokeWidth="2" />
            <rect x={520} y={loadsY - 10} width={330} height={loadRuns.length * 26 + 20} rx="10" className="fill-card stroke-border" strokeWidth="1.5" strokeDasharray="4 3" />
            {loadRuns.map((r, i) => {
              const ly = loadsY + 16 + i * 26;
              return (
                <g key={r.key}>
                  <text x={534} y={ly} className="fill-foreground text-[12px]">{r.label.replace("Bus bar → ", "")}</text>
                  <text x={790} y={ly} textAnchor="end" className="fill-primary text-[11px] font-semibold">{r.wire?.awg} AWG</text>
                  <text x={840} y={ly} textAnchor="end" className="fill-muted-foreground text-[11px]">{r.fuse} A</text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}