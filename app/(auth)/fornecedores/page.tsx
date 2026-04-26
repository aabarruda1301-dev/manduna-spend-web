"use client";

import { useEffect, useState } from "react";
import { CurrencyProvider, useCurrency } from "@/components/CurrencyContext";
import { Topbar } from "@/components/Topbar";
import { DrillModal } from "@/components/DrillModal";
import { createClient } from "@/lib/supabase/client";
import { fmtMoney, fmtNum } from "@/lib/format";

type Row = { supplier: string; n: number; total: number };

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
    sb.from("transactions").select("supplier,total_amount").not("supplier", "is", null).then(({ data }) => {
      const agg: Record<string, { n: number; total: number }> = {};
      (data ?? []).forEach((r: any) => {
        const k = r.supplier; if (!k) return;
        agg[k] ??= { n: 0, total: 0 };
        agg[k].n++; agg[k].total += r.total_amount ?? 0;
      });
      const arr = Object.entries(agg).map(([supplier, v]) => ({ supplier, ...v }))
        .sort((a, b) => b.total - a.total);
      setRows(arr);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Topbar title="Fornecedores" />
      <div className="px-7 py-6">
        <div className="bg-panel border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Fornecedores ({rows.length}) — clique em um para ver as transações</h3>
          {loading ? <p className="text-muted text-sm">Carregando…</p> : (
            <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-panel text-muted text-[11px] uppercase">
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Fornecedor</th>
                    <th className="text-right py-2 px-2">Transações</th>
                    <th className="text-right py-2 px-2">Total</th>
                    <th className="text-right py-2 px-2">Ticket médio</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.supplier} className="border-b border-border hover:bg-hover cursor-pointer text-accent"
                        onClick={() => setDrill({ title: `Fornecedor: ${r.supplier}`, filter: { supplier: r.supplier } })}>
                      <td className="py-1.5 px-2">{i + 1}</td>
                      <td className="py-1.5 px-2">{r.supplier}</td>
                      <td className="py-1.5 px-2 text-right">{fmtNum(r.n)}</td>
                      <td className="py-1.5 px-2 text-right">{fmtMoney(r.total, currency)}</td>
                      <td className="py-1.5 px-2 text-right">{fmtMoney(r.total / r.n, currency)}</td>
                    </tr>
                  ))}
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
