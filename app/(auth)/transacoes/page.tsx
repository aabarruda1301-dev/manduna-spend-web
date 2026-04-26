"use client";

import { useEffect, useState } from "react";
import { CurrencyProvider, useCurrency } from "@/components/CurrencyContext";
import { Topbar } from "@/components/Topbar";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/lib/types";
import { fmtMoney, fmtDate, fmtNum } from "@/lib/format";

export default function Page() {
  return <CurrencyProvider><Inner /></CurrencyProvider>;
}

function Inner() {
  const { currency } = useCurrency();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("");
  const [department, setDepartment] = useState("");
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const sb = createClient();
    sb.from("transactions").select("supplier").not("supplier", "is", null).then(({ data }) => {
      const set = new Set((data ?? []).map((r: any) => r.supplier).filter(Boolean));
      setSuppliers([...set].sort());
    });
    sb.from("transactions").select("department").not("department", "is", null).then(({ data }) => {
      const set = new Set((data ?? []).map((r: any) => r.department).filter(Boolean));
      setDepartments([...set].sort());
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const sb = createClient();
    let q = sb.from("transactions").select("*").order("txn_date", { ascending: false }).limit(1000);
    if (supplier) q = q.eq("supplier", supplier);
    if (department) q = q.eq("department", department);
    if (search) q = q.ilike("description", `%${search}%`);
    q.then(({ data }) => { setRows((data as Transaction[]) ?? []); setLoading(false); });
  }, [search, supplier, department]);

  const total = rows.reduce((a, r) => a + (r.total_amount ?? 0), 0);

  return (
    <>
      <Topbar title="Transações">
        <input className="bg-panel2 border border-border text-text rounded px-2 py-1.5 text-xs min-w-[160px]"
               placeholder="Buscar descrição..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="bg-panel2 border border-border rounded px-2 py-1.5 text-xs" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">Todos depts</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="bg-panel2 border border-border rounded px-2 py-1.5 text-xs" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
          <option value="">Todos fornecedores</option>
          {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="bg-panel2 border border-border text-muted px-3 py-1.5 rounded text-xs"
                onClick={() => { setSearch(""); setSupplier(""); setDepartment(""); }}>Limpar</button>
      </Topbar>

      <div className="px-7 py-6">
        <div className="bg-panel border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">{loading ? "Carregando…" : `${fmtNum(rows.length)} transações — ${fmtMoney(total, currency)}`}</h3>
          <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-panel text-muted text-[11px] uppercase">
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2">Data</th>
                  <th className="text-left py-2 px-2">Categoria</th>
                  <th className="text-left py-2 px-2">Fornecedor</th>
                  <th className="text-left py-2 px-2">Depto</th>
                  <th className="text-left py-2 px-2">Descrição</th>
                  <th className="text-right py-2 px-2">Qtd</th>
                  <th className="text-right py-2 px-2">Unit</th>
                  <th className="text-right py-2 px-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-border hover:bg-hover">
                    <td className="py-1.5 px-2">{fmtDate(t.txn_date)}</td>
                    <td className="py-1.5 px-2">{t.sheet_name}</td>
                    <td className="py-1.5 px-2">{t.supplier ?? "—"}</td>
                    <td className="py-1.5 px-2">{t.department ?? "—"}</td>
                    <td className="py-1.5 px-2">{t.description ?? ""}</td>
                    <td className="py-1.5 px-2 text-right">{fmtNum(t.quantity)}</td>
                    <td className="py-1.5 px-2 text-right">{fmtMoney(t.unit_price, currency)}</td>
                    <td className="py-1.5 px-2 text-right">{fmtMoney(t.total_amount, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 1000 && <p className="text-xs text-muted mt-3">Mostrando 1000 transações. Refine os filtros para ver mais.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
