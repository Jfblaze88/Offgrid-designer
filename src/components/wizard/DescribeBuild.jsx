import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

const EXAMPLE = "Sprinter van, compressor fridge, two fans, laptop all day, Starlink, induction hob for cooking, no shore power.";

export default function DescribeBuild({ onResult }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("parseBuildDescription", { description: text });
      const appliances = res?.data?.appliances || [];
      if (!appliances.length) setError("Couldn't find any appliances in that — try adding more detail.");
      else onResult(appliances);
    } catch (e) {
      setError(e?.response?.data?.error || "Something went wrong. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3 no-print">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Describe your build in plain English.</h3>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder={EXAMPLE}
        className="resize-none bg-background/60"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={submit} disabled={busy || !text.trim()}>
          {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Reading your build…</> : "Fill my appliance list"}
        </Button>
        <button type="button" onClick={() => setText(EXAMPLE)} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4">
          Use the example
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}