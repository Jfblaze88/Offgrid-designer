import React, { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const inputCls = "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full";

export default function CustomApplianceForm({ onAdd }) {
  const [form, setForm] = useState({ name: "", watts: "", hours_per_day: "", power_type: "DC" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.name.trim() && parseFloat(form.watts) > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onAdd({ name: form.name.trim(), watts: parseFloat(form.watts), hours_per_day: parseFloat(form.hours_per_day) || 0, power_type: form.power_type });
    setForm({ name: "", watts: "", hours_per_day: "", power_type: "DC" });
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-dashed border-border p-3.5 space-y-2.5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Custom appliance</div>
      <input placeholder="Name" value={form.name} onChange={set("name")} className={inputCls} />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" min="1" placeholder="Watts" value={form.watts} onChange={set("watts")} className={inputCls} />
        <input type="number" min="0" max="24" step="0.5" placeholder="Hours / day" value={form.hours_per_day} onChange={set("hours_per_day")} className={inputCls} />
      </div>
      <div className="flex gap-2">
        {["DC", "AC"].map((t) => (
          <button type="button" key={t} onClick={() => setForm({ ...form, power_type: t })}
            className={cn("flex-1 rounded-lg border py-1.5 text-sm font-medium", form.power_type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>
            {t}
          </button>
        ))}
        <button type="submit" disabled={!valid} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </form>
  );
}