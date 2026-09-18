import React from "react";

export default function InstallOrder({ steps }) {
  return (
    <ol className="px-5 py-4 space-y-3">
      {steps.map((text, i) => (
        <li key={i} className="flex gap-4 text-sm leading-relaxed">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/10 font-display text-sm font-semibold text-primary print-step">{i + 1}</span>
          <span className="pt-1">{text}</span>
        </li>
      ))}
    </ol>
  );
}