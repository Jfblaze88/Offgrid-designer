import React from "react";
import { ShieldAlert } from "lucide-react";

export default function SafetyDisclaimer() {
  return (
    <aside className="print-disclaimer flex gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-4">
      <ShieldAlert className="h-5 w-5 shrink-0 text-primary mt-0.5" />
      <div className="text-sm leading-relaxed">
        <p className="font-semibold text-foreground">Safety disclaimer — planning aid only</p>
        <p className="mt-1 text-muted-foreground">
          This tool produces estimates based on standard sizing rules. Actual requirements vary with cable routing,
          ambient temperature, bundling and local regulations. You are responsible for verifying every wire gauge and
          fuse rating with a qualified marine or RV electrician before installation.
        </p>
      </div>
    </aside>
  );
}