"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/lib/types";
import { fmtMoney, fmtDate, fmtNum } from "@/lib/format";
import { useCurrency } from "./CurrencyContext";

type Filter = {
  cat?: string;
  ym?: string;          // YYYY-MM
  ymFrom?: string;
  ymTo?: string;
  supplier?: string;
  department?: string;
};

export function DrillModal({
  open, title, filter, onClose,
}: { open: boolean; title: string; filter: Filter; onClose: () => void; }) {
  const { currency } = useCurrency();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const supabase = createClient();
    let q = supabase.from("transactions").select("*").order("txn_date");
    if (filter.cat) q = q.eq("sheet_name", filter.cat);
    if (filter.ym) q = q.eq("month_year", filter.ym);
    if (filter.ymFrom) q = q.gte("month_year", filter.ymFrom);
    if (filter.ymTo) q = q.lte("month_year", filter.ymTo);
    if (filter.supplier) q = q.eq("supplier", filter.supplier);
    if (filter.department) q = q.eq("department", filter.department);
    q.then(({ data }) => {
      setRows((data as Transaction[]) ?? []);
      setLoading(false);
    });
  }, [open, JSON.stringify(filter)]);

  if (!open) return null;

  const total = rows.reduce((a, r) => a + (r.total_amount ?? 0), 0);

  function exportPDF() {
    const generated = new Date().toLocaleString("pt-BR");
    const sorted = rows.slice().sort((a, b) => a.txn_date.localeCompare(b.txn_date));
    const escHtml = (s: any) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"} as any)[c]);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escHtml(title)}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #222; margin: 24px; font-size: 11px; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  .sub { color: #666; font-size: 10px; margin-bottom: 14px; }
  .kpis { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
  .kpi { border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; font-size: 10px; }
  .kpi b { display: block; font-size: 13px; color: #000; margin-top: 3px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th, td { padding: 5px 7px; text-align: left; border-bottom: 1px solid #e2e2e2; vertical-align: top; }
  th { background: #f4f4f4; font-weight: 600; font-size: 9.5px; text-transform: uppercase; letter-spacing: .3px; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tfoot td { font-weight: 600; border-top: 2px solid #888; background: #fafafa; }
  @media print { body { margin: 12mm; } thead { display: table-header-group; } tr { page-break-inside: avoid; } .print-btn { display: none; } }
  .print-btn { position: fixed; top: 12px; right: 12px; background: #2c5fd9; color: #fff; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; }
</style>
</head><body>
<button class="print-btn" onclick="window.print()">Imprimir / Salvar PDF</button>
<h1>${escHtml(title)}</h1>
<div class="sub">PT Manduna Eco Resort — Spend Detail · Gerado em ${escHtml(generated)}</div>
<div class="kpis">
  <div class="kpi">Transações<b>${rows.length.toLocaleString("id-ID")}</b></div>
  <div class="kpi">Total (Rp)<b>Rp ${Math.round(total).toLocaleString("id-ID")}</b></div>
  <div class="kpi">Total (USD @ 16500)<b>USD ${(total/16500).toLocaleString("en-US",{maximumFractionDigits:2,minimumFractionDigits:2})}</b></div>
</div>
<table>
  <thead><tr><th>Data</th><th>Categoria</th><th>Fornecedor</th><th>Depto</th><th>Descrição</th><th class="num">Qtd</th><th class="num">Unit (Rp)</th><th class="num">Total (Rp)</th></tr></thead>
  <tbody>${sorted.map(t => `<tr>
    <td>${escHtml(fmtDate(t.txn_date))}</td>
    <td>${escHtml(t.sheet_name)}</td>
    <td>${escHtml(t.supplier ?? "—")}</td>
    <td>${escHtml(t.department ?? "—")}</td>
    <td>${escHtml(t.description ?? "")}</td>
    <td class="num">${t.quantity != null ? t.quantity.toLocaleString("id-ID") : "—"}</td>
    <td class="num">${t.unit_price != null ? "Rp " + Math.round(t.unit_price).toLocaleString("id-ID") : "—"}</td>
    <td class="num">${t.total_amount != null ? "Rp " + Math.round(t.total_amount).toLocaleString("id-ID") : "—"}</td>
  </tr>`).join("")}</tbody>
  <tfoot><tr><td colspan="7" class="num">Total</td><td class="num">Rp ${Math.round(total).toLocaleString("id-ID")}</td></tr></tfoot>
</table>
<script>setTimeout(() => window.print(), 500);</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { alert("Pop-up bloqueado. Permita pop-ups para exportar PDF."); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-panel border border-border rounded-xl w-full max-w-[1100px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <h3 className="flex-1 text-[15px] font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-white text-2xl leading-none">×</button>
        </div>
        <div className="px-6 py-4 overflow-y-auto">
          {loading ? <p className="text-muted text-sm">Carregando…</p> : (
            <table className="w-full text-xs">
              <thead className="text-muted text-[11px] uppercase">
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2">Data</th>
                  <th className="text-left py-2 px-2">Fornecedor</th>
                  <th className="text-left py-2 px-2">Depto</th>
                  <th className="text-left py-2 px-2">Descrição</th>
                  <th className="text-right py-2 px-2">Qtd</th>
                  <th className="text-right py-2 px-2">Unit</th>
                  <th className="text-right py-2 px-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(t => (
                  <tr key={t.id} className="border-b border-border hover:bg-hover">
                    <td className="py-1.5 px-2">{fmtDate(t.txn_date)}</td>
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
          )}
        </div>
        <div className="px-6 py-3 border-t border-border flex items-center justify-between text-xs">
          <span className="text-muted">{rows.length} transações — {fmtMoney(total, currency)}</span>
          <button onClick={exportPDF} className="bg-accent text-white px-4 py-1.5 rounded font-semibold">Exportar PDF</button>
        </div>
      </div>
    </div>
  );
}
