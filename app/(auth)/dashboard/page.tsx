"use client";

import { useState } from "react";
import { CurrencyProvider, useCurrency } from "@/components/CurrencyContext";
import { Topbar } from "@/components/Topbar";
import { DrillModal } from "@/components/DrillModal";
import structureJson from "@/lib/summary-structure.json";
import type { SummaryStructure } from "@/lib/types";
import { fmtMoneyShort, fmtYM } from "@/lib/format";

const S = structureJson as SummaryStructure;

export default function DashboardPage() {
  return (
    <CurrencyProvider>
      <DashboardContent />
    </CurrencyProvider>
  );
}

function DashboardContent() {
  const { currency } = useCurrency();
  const [from, setFrom] = useState(S.months[0]);
  const [to, setTo] = useState(S.months[S.months.length - 1]);
  const [drill, setDrill] = useState<{ title: string; filter: any } | null>(null);

  const fromIdx = Math.max(0, S.months.indexOf(from));
  const toIdx = Math.max(fromIdx, S.months.indexOf(to));
  const months = S.months.slice(fromIdx, toIdx + 1);
  const slice = (arr: (number | null)[]) => arr.slice(fromIdx, toIdx + 1);
  const sum = (arr: (number | null)[]): number =>
    arr.reduce<number>((a, v) => a + (typeof v === "number" ? v : 0), 0);

  function fmtCell(v: number | null) {
    if (v == null) return <span className="cell-na">—</span>;
    if (v === 0) return <span className="cell-zero">·</span>;
    return <>{fmtMoneyShort(v, currency)}</>;
  }

  return (
    <>
      <Topbar title="Dashboard">
        <span className="text-xs text-muted">Período:</span>
        <select className="bg-panel2 border border-border rounded px-2 py-1 text-xs" value={from} onChange={(e) => { const v = e.target.value; setFrom(v); if (v > to) setTo(v); }}>
          {S.months.map(m => <option key={m} value={m}>{fmtYM(m)}</option>)}
        </select>
        <span className="text-xs text-muted">até</span>
        <select className="bg-panel2 border border-border rounded px-2 py-1 text-xs" value={to} onChange={(e) => { const v = e.target.value; setTo(v); if (v < from) setFrom(v); }}>
          {S.months.map(m => <option key={m} value={m}>{fmtYM(m)}</option>)}
        </select>
        <button className="bg-panel2 border border-border text-muted px-3 py-1.5 rounded text-xs" onClick={() => { setFrom(S.months[0]); setTo(S.months[S.months.length - 1]); }}>Todo o período</button>
      </Topbar>

      <div className="px-7 py-6 space-y-5">
        {/* SUMMARY top */}
        <Card title={`Summary — 7 grupos × ${months.length} ${months.length === 1 ? "mês" : "meses"}`}>
          <div className="overflow-x-auto max-h-[60vh] border border-border rounded">
            <table className="summary-table">
              <thead>
                <tr>
                  <th className="cat-col">Description</th>
                  {months.map(m => <th key={m} className="num">{fmtYM(m)}</th>)}
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {S.topSummary.map((g) => {
                  const vals = slice(g.values); const tot = sum(vals);
                  return (
                    <tr key={g.label}>
                      <td className="cat-col">{g.label}</td>
                      {vals.map((v, i) => <td key={i} className="num">{fmtCell(v)}</td>)}
                      <td className="num"><b>{fmtCell(tot)}</b></td>
                    </tr>
                  );
                })}
                {(() => { const t = slice(S.topTotal); const grand = sum(t); return (
                  <tr className="total-row">
                    <td className="cat-col"><b>Total</b></td>
                    {t.map((v, i) => <td key={i} className="num"><b>{fmtCell(v)}</b></td>)}
                    <td className="num"><b>{fmtCell(grand)}</b></td>
                  </tr>
                ); })()}
              </tbody>
            </table>
          </div>
        </Card>

        {/* DETAIL */}
        <Card title="Detail — 94 categorias agrupadas. Clique em qualquer valor sublinhado para ver as compras.">
          <div className="overflow-x-auto max-h-[80vh] border border-border rounded">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th className="cat-col">Description</th>
                  {months.map(m => <th key={m} className="num">{fmtYM(m)}</th>)}
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {S.groups.map((grp) => (
                  <>
                    <tr key={grp.name + "-h"} className="group-row">
                      <td></td>
                      <td className="cat-col" colSpan={months.length + 2}><b>{grp.name}</b></td>
                    </tr>
                    {grp.categories.map((cat) => {
                      const monthlySliced = slice(cat.monthly);
                      const tot = sum(monthlySliced);
                      const catCell = cat.hasDetail
                        ? <span className="link" onClick={() => setDrill({ title: `Categoria: ${cat.name}`, filter: { cat: cat.name } })}>{cat.name}</span>
                        : <span>{cat.name}</span>;
                      return (
                        <tr key={cat.name}>
                          <td className="num text-center text-muted">{cat.num}</td>
                          <td className="cat-col">{catCell}</td>
                          {monthlySliced.map((v, i) => {
                            const ym = months[i];
                            if (cat.hasDetail && typeof v === "number" && v > 0) {
                              return (
                                <td key={i} className="num">
                                  <span className="link" onClick={() => setDrill({ title: `${cat.name} — ${fmtYM(ym)}`, filter: { cat: cat.name, ym } })}>
                                    {fmtCell(v)}
                                  </span>
                                </td>
                              );
                            }
                            return <td key={i} className="num">{fmtCell(v)}</td>;
                          })}
                          <td className="num">
                            {cat.hasDetail && tot > 0 ? (
                              <span className="link" onClick={() => setDrill({ title: `${cat.name} — ${fmtYM(months[0])} a ${fmtYM(months[months.length-1])}`, filter: { cat: cat.name, ymFrom: months[0], ymTo: months[months.length - 1] } })}>
                                <b>{fmtCell(tot)}</b>
                              </span>
                            ) : <b>{fmtCell(tot)}</b>}
                          </td>
                        </tr>
                      );
                    })}
                    {(() => { const totals = slice(grp.totals); const tot = sum(totals); return (
                      <tr key={grp.name + "-t"} className="subtotal-row">
                        <td></td>
                        <td className="cat-col"><b>Total {grp.name}</b></td>
                        {totals.map((v, i) => <td key={i} className="num"><b>{fmtCell(v)}</b></td>)}
                        <td className="num"><b>{fmtCell(tot)}</b></td>
                      </tr>
                    ); })()}
                    <tr><td colSpan={months.length + 3} className="h-2 bg-bg p-0 border-0"></td></tr>
                  </>
                ))}
                {(() => { const g = slice(S.grandTotal); const grand = sum(g); return (
                  <tr className="total-row">
                    <td></td>
                    <td className="cat-col"><b>GRAND TOTAL</b></td>
                    {g.map((v, i) => <td key={i} className="num"><b>{fmtCell(v)}</b></td>)}
                    <td className="num"><b>{fmtCell(grand)}</b></td>
                  </tr>
                ); })()}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {drill && <DrillModal open={true} title={drill.title} filter={drill.filter} onClose={() => setDrill(null)} />}
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-panel border border-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
