import React from "react";
import { motion } from "framer-motion";
import { Zap, BatteryCharging, Cable, ClipboardList, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  { label: "Load", icon: Zap },
  { label: "System", icon: BatteryCharging },
  { label: "Wiring", icon: Cable },
  { label: "Build Sheet", icon: ClipboardList },
];

export default function ProgressBar({ step, onSelect }) {
  const pct = (step / (STEPS.length - 1)) * 100;
  return (
    <div className="no-print">
      <div className="relative h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={s.label}
              onClick={() => onSelect(i)}
              className={cn(
                "group flex items-center gap-2.5 text-left rounded-xl px-2 py-2 transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all",
                  active && "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]",
                  done && "border-primary/50 bg-primary/10 text-primary",
                  !active && !done && "border-border bg-card"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </span>
              <span className="hidden sm:flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-[0.16em]">Step {i + 1}</span>
                <span className="text-sm font-medium">{s.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}