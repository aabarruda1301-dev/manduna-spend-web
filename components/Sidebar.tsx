"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pivot", label: "Categoria × Mês" },
  { href: "/categorias", label: "Categorias" },
  { href: "/fornecedores", label: "Fornecedores" },
  { href: "/departamentos", label: "Departamentos" },
  { href: "/transacoes", label: "Transações" },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <aside className="w-60 bg-panel border-r border-border flex flex-col flex-shrink-0">
      <div className="px-4 py-5 border-b border-border">
        <h1 className="text-base font-semibold">Manduna Eco Resort</h1>
        <p className="text-[11px] text-muted mt-1">Spend Dashboard 2025–2026</p>
      </div>
      <nav className="flex-1 p-2">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href} href={item.href}
              className={`block px-3 py-2 rounded text-[13px] mb-1 ${
                active ? "bg-accent text-white" : "text-muted hover:bg-hover hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-border text-[11px] text-muted">
        <div className="truncate" title={email}>{email}</div>
        <button onClick={handleLogout} className="mt-2 text-accent hover:underline">Sair</button>
      </div>
    </aside>
  );
}
