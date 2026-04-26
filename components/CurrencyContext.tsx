"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Currency } from "@/lib/format";

type Ctx = { currency: Currency; toggle: () => void };
const C = createContext<Ctx>({ currency: "IDR", toggle: () => {} });

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("IDR");
  function toggle() { setCurrency((c) => (c === "IDR" ? "USD" : "IDR")); }
  return <C.Provider value={{ currency, toggle }}>{children}</C.Provider>;
}

export function useCurrency() { return useContext(C); }
