"use client";

import { useEffect, useState } from "react";
import { CurrencyProvider, useCurrency } from "@/components/CurrencyContext";
import { Topbar } from "@/components/Topbar";
import { DrillModal } from "@/components/DrillModal";
import { createClient } from "@/lib/supabase/client";
import { fmtMoney, fmtNum } from "@/lib/format";

type Row = { sheet_name: string; n: number; total: number };

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
    sb.from("transactions").select("sheet_name,total_amount").then(({ data }) => {
      const agg: Record<string, { n: number; total: number }> = {};
      (data ?? []).forEach((r: any) => {
        agg[r.sheet_name] ??= { n: 0, total: 0 };
        agg[r.sheet_name].n++;
        agg[r.sheet_name].total += r.total_amount ?? 0;
      });
      const arr = Object.entries(agg).map(([sheet_name, v]) => ({ sheet_name, ...v }))
        .sort((a, b) => b.total - a.total);
      setRows(arr);
      setLoading(false);
    });
  }, []);

  const grand = rows.reduce((a, r) => a + r.total, 0);

  return (
    <>
      <Topbar title="Categorias" />
      <div className="px-7 py-6">
        <div className="bg-panel border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Categorias ({rows.length}) — clique em uma para ver as transações</h3>
          {loading ? <p className="text-muted text-sm">Carregando…</p> : (
            <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-panel text-muted text-[11px] uppercase">
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Categoria</th>
                    <th className="text-right py-2 px-2">Transações</th>
                    <th className="text-right py-2 px-2">Total</th>
                    <th className="text-right py-2 px-2">% do total</th>
                    <th className="text-right py-2 px-2">Ticket médio</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const num = +r.sheet_name.split(".")[0];
                    return (
                      <tr key={r.sheet_name} className="border-b border-border hover:bg-hover cursor-pointer text-accent"
                          onClick={() => setDrill({ title: `Categoria: ${r.sheet_name}`, filter: { cat: r.sheet_name } })}>
                        <td className="py-1.5 px-2">{num}</td>
                        <td className="py-1.5 px-2">{r.sheet_name.replace(/^\d+\.\s*/, "")}</td>
                        <td className="py-1.5 px-2 text-right">{fmtNum(r.n)}</td>
                        <td className="py-1.5 px-2 text-right">{fmtMoney(r.total, currency)}</td>
                        <td className="py-1.5 px-2 text-right">{grand ? (r.total / grand * 100).toFixed(2) + "%" : "0%"}</td>
                        <td className="py-1.5 px-2 text-right">{fmtMoney(r.total / r.n, currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {drill && <DrillModal open={true} title={drill.title} filter={drill.filter} onClose={() => setDrill(null)} />}
    </>
  );
}
