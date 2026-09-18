import React from "react";

export default function PartsList({ parts }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-xs text-muted-foreground">
        <tr className="border-b border-border">
          <th className="text-left font-medium px-5 py-2 w-12">#</th>
          <th className="text-left font-medium px-3 py-2">Part</th>
          <th className="text-right font-medium px-5 py-2">Qty</th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {parts.map((p, i) => (
          <tr key={p.item} className="border-b border-border/60 last:border-0">
            <td className="px-5 py-2 text-muted-foreground">{i + 1}</td>
            <td className="px-3 py-2">{p.item}</td>
            <td className="text-right px-5 py-2 font-medium">{p.qty} <span className="text-xs text-muted-foreground">{p.unit}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}