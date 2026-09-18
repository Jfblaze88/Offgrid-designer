import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ApplianceCatalog from "./ApplianceCatalog";
import LoadRow from "./LoadRow";
import LoadTotals from "./LoadTotals";
import CustomApplianceForm from "./CustomApplianceForm";
import { loadSummary } from "@/lib/calc";

export default function StepLoad({ project, catalog, update }) {
  const loads = project.loads || [];
  const s = loadSummary(loads);
  const selectedIds = new Set(loads.map((l) => l.appliance_id));

  const add = (a) =>
    update({ loads: [...loads, { appliance_id: a.id ?? `custom-${Date.now()}`, name: a.name, category: a.category ?? "Custom", watts: a.watts, hours_per_day: a.hours_per_day ?? 1, power_type: a.power_type, surge_watts: a.surge_watts || a.watts, quantity: 1 }] });
  const change = (i, patch) => update({ loads: loads.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const remove = (i) => update({ loads: loads.filter((_, j) => j !== i) });

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">What will you power?</h2>
        <p className="mt-2 text-muted-foreground max-w-xl">Tap appliances to add them, then adjust watts, quantity and hours of use per day.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <section className="lg:col-span-3 space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Your loads · {loads.length}</h3>
          {loads.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Nothing added yet — pick appliances from the catalog.
            </div>
          )}
          <AnimatePresence initial={false}>
            {loads.map((l, i) => (
              <motion.div key={l.appliance_id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                <LoadRow load={l} onChange={(p) => change(i, p)} onRemove={() => remove(i)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
        <aside className="lg:col-span-2 space-y-5">
          <CustomApplianceForm onAdd={add} />
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Catalog</h3>
            <ApplianceCatalog catalog={catalog} selectedIds={selectedIds} onAdd={add} />
          </div>
        </aside>
      </div>

      <LoadTotals summary={s} />
    </div>
  );
}