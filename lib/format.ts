export const EXCHANGE_RATE_USD_IDR = 16500;

export type Currency = "IDR" | "USD";

export function fmtMoney(v: number | null | undefined, currency: Currency = "IDR") {
  if (v == null) return "—";
  if (currency === "USD") {
    const x = v / EXCHANGE_RATE_USD_IDR;
    return "USD " + x.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }
  return "Rp " + Math.round(v).toLocaleString("id-ID");
}

export function fmtMoneyShort(v: number | null | undefined, currency: Currency = "IDR") {
  if (v == null) return "—";
  const x = currency === "USD" ? v / EXCHANGE_RATE_USD_IDR : v;
  const sym = currency === "USD" ? "USD " : "Rp ";
  if (Math.abs(x) >= 1e9) return sym + (x / 1e9).toFixed(2) + "B";
  if (Math.abs(x) >= 1e6) return sym + (x / 1e6).toFixed(1) + "M";
  if (Math.abs(x) >= 1e3) return sym + (x / 1e3).toFixed(0) + "K";
  return sym + x.toFixed(currency === "USD" ? 2 : 0);
}

export function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

export function fmtYM(s: string | null | undefined) {
  if (!s) return "—";
  const [y, m] = s.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[+m - 1]}/${y.slice(2)}`;
}

export function fmtNum(v: number | null | undefined) {
  return v != null ? v.toLocaleString("id-ID") : "—";
}
