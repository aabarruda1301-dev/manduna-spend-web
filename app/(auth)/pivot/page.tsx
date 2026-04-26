"use client";

import { useEffect, useState } from "react";
import { CurrencyProvider, useCurrency } from "@/components/CurrencyContext";
import { Topbar } from "@/components/Topbar";
import { DrillModal } from "@/components/DrillModal";
import { createClient } from "@/lib/supabase/client";
import { fmtMoneyShort, fmtYM } from "@/lib/format";

type Row = { sheet_name: string; month_year: string; total_amount: number | null };

export default function Page() {
  return <CurrencyProvider><Inner /></CurrencyProvider>;
}

function Inner() {
  const { currency } = useCurrency();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [drill, setDrill] = useState<{ title: string; filter: any } | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.from("transactions").select("sheet_name,month_year,total_amount").then(({ data }) => {
      setRows((data as Row[]) ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <><Topbar title="Categoria × Mês" /><div className="px-7 py-6 text-muted">Carregando…</div></>;

  const matrix: Record<string, Record<string, number>> = {};
  const yms = new Set<string>();
  rows.forEach((r) => {
    if (!r.sheet_name || !r.month_year) return;
    matrix[r.sheet_name] ??= {};
    matrix[r.sheet_name][r.month_year] = (matrix[r.sheet_name][r.month_year] ?? 0) + (r.total_amount ?? 0);
    yms.add(r.month_year);
  });
  const ymList = [...yms].sort();
  const cats = Object.keys(matrix).sort((a, b) => +a.split(".")[0] - +b.split(".")[0]);
  const colTotals: Record<string, number> = {};
  let grand = 0;
  ymList.forEach(y => colTotals[y] = 0);
  cats.forEach(c => ymList.forEach(y => { const v = matrix[c][y] ?? 0; colTotals[y] += v; grand += v; }));

  return (
    <>
      <Topbar title="Categoria × Mês" />
      <div className="px-7 py-6">
        <div className="bg-panel border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Categoria × Mês — clique em qualquer valor para ver as transações</h3>
          <div className="overflow-x-auto max-h-[80vh] overflow-y-auto border border-border rounded">
            <table className="summary-table">
              <thead>
                <tr>
                  <th className="cat-col">Categoria</th>
                  {ymList.map(y => <th key={y} className="num">{fmtYM(y)}</th>)}
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {cats.map(c => {
                  const rowTotal = ymList.reduce((a, y) => a + (matrix[c][y] ?? 0), 0);
                  return (
                    <tr key={c}>
                      <td className="cat-col">
                        <span className="link" onClick={() => setDrill({ title: `Categoria: ${c}`, filter: { cat: c } })}>{c}</span>
                      </td>
                      {ymList.map(y => {
                        const v = matrix[c][y] ?? 0;
                        return (
                          <td key={y} className="num">
                            {v > 0 ? (
                              <span className="link" onClick={() => setDrill({ title: `${c} — ${fmtYM(y)}`, filter: { cat: c, ym: y } })}>
                                {fmtMoneyShort(v, currency)}
                              </span>
                            ) : <span className="cell-zero">·</span>}
                          </td>
                        );
                      })}
                      <td className="num"><b>{fmtMoneyShort(rowTotal, currency)}</b></td>
                    </tr>
                  );
                })}
                <tr className="total-row">
                  <td className="cat-col"><b>TOTAL</b></td>
                  {ymList.map(y => <td key={y} className="num"><b>{fmtMoneyShort(colTotals[y], currency)}</b></td>)}
                  <td className="num"><b>{fmtMoneyShort(grand, currency)}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {drill && <DrillModal open={true} title={drill.title} filter={drill.filter} onClose={() => setDrill(null)} />}
    </>
  );
}
