import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manduna Eco Resort — Spend Dashboard",
  description: "Dashboard de gastos PT Manduna Eco Resort",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
