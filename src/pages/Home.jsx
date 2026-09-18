import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { ChevronLeft, ChevronRight, LogOut, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProgressBar, { STEPS } from "@/components/wizard/ProgressBar";
import StepLoad from "@/components/wizard/StepLoad";
import StepSystem from "@/components/wizard/StepSystem";
import StepWiring from "@/components/wizard/StepWiring";
import StepBuildSheet from "@/components/wizard/StepBuildSheet";

export default function Home() {
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [wires, setWires] = useState([]);
  const [fuses, setFuses] = useState([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const [projects, apps, w, f] = await Promise.all([
        base44.entities.Project.filter({ user_id: me.id }),
        base44.entities.Appliance.list("category", 200),
        base44.entities.WireSpec.list(),
        base44.entities.FuseSize.list(),
      ]);
      let p = projects[0];
      if (!p) {
        p = await base44.entities.Project.create({
          user_id: me.id,
          name: `${me.full_name?.split(" ")[0] || "My"}'s 12V system`,
          vehicle_type: "camper_van", battery_type: "lifepo4",
          days_autonomy: 2, sun_hours: 4, drive_hours: 1, loads: [], run_lengths: {},
        });
      }
      setUser(me); setProject(p); setCatalog(apps); setWires(w); setFuses(f);
    })();
  }, []);

  const persist = useMemo(() => debounce((id, data) => base44.entities.Project.update(id, data), 500), []);
  const update = (patch) => {
    const next = { ...project, ...patch };
    setProject(next);
    const { id, created_date, updated_date, created_by_id, ...data } = next;
    persist(id, data);
  };

  if (!project) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const stepProps = { project, update, catalog, wires, fuses };
  const views = [<StepLoad {...stepProps} />, <StepSystem {...stepProps} />, <StepWiring {...stepProps} />, <StepBuildSheet {...stepProps} />];

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-border/60">
        <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Zap className="h-4 w-4" /></span>
            <span className="font-display font-semibold tracking-tight">OffGrid Designer</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="hidden sm:inline truncate max-w-[180px]">{user?.email}</span>
            <button onClick={() => base44.auth.logout()} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 md:px-8 py-8 md:py-12 space-y-10">
        <ProgressBar step={step} onSelect={setStep} />
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            {views[step]}
          </motion.div>
        </AnimatePresence>
        <nav className="no-print flex items-center justify-between pt-6 border-t border-border/60">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {step < STEPS.length - 1 && (
            <button onClick={() => setStep((s) => s + 1)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all">
              Next: {STEPS[step + 1].label} <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </nav>
        <footer className="no-print text-center text-xs text-muted-foreground pb-4">
          Planning aid only - have your design checked by a qualified installer before you build.
        </footer>
      </main>
    </div>
  );
}