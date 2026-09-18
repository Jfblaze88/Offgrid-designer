import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import ProgressBar, { STEPS } from "@/components/wizard/ProgressBar";
import StepLoad from "@/components/wizard/StepLoad";
import StepSystem from "@/components/wizard/StepSystem";
import StepWiring from "@/components/wizard/StepWiring";
import StepBuildSheet from "@/components/wizard/StepBuildSheet";
import appliances from "@/data/appliances.json";
import wireSpecs from "@/data/wireSpecs.json";
import fuseSizes from "@/data/fuseSizes.json";

const DEFAULT_PROJECT = {
  name: "My 12V system",
  vehicle_type: "camper_van",
  battery_type: "lifepo4",
  days_autonomy: 2,
  sun_hours: 4,
  drive_hours: 1,
  loads: [],
  run_lengths: {},
};

export default function Home() {
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [step, setStep] = useState(0);

  const update = (patch) => setProject((prev) => ({ ...prev, ...patch }));

  const stepProps = { project, update, catalog: appliances, wires: wireSpecs, fuses: fuseSizes };
  const views = [<StepLoad {...stepProps} />, <StepSystem {...stepProps} />, <StepWiring {...stepProps} />, <StepBuildSheet {...stepProps} />];

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-border/60">
        <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Zap className="h-4 w-4" /></span>
            <span className="font-display font-semibold tracking-tight">OffGrid Designer</span>
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
