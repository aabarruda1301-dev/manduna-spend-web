"use client";
import { useCurrency } from "./CurrencyContext";

export function Topbar({ title, children }: { title: string; children?: React.ReactNode }) {
  const { currency, toggle } = useCurrency();
  return (
    <div className="sticky top-0 z-10 bg-bg border-b border-border px-7 py-4 flex items-center gap-4 flex-wrap">
      <h2 className="text-lg font-semibold flex-1 min-w-[160px]">{title}</h2>
      <div className="flex items-center gap-2 flex-wrap">
        {children}
        <button
          onClick={toggle}
          className={`px-3 py-1.5 rounded text-xs font-semibold min-w-[56px] ${
            currency === "USD" ? "bg-accent2 text-bg" : "bg-accent text-white"
          }`}
        >
          {currency === "USD" ? "USD" : "Rp"}
        </button>
      </div>
    </div>
  );
}
