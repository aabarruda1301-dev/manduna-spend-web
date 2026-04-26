"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-panel border border-border rounded-lg p-8 space-y-4"
      >
        <div className="text-center mb-2">
          <h1 className="text-lg font-semibold">Manduna Eco Resort</h1>
          <p className="text-xs text-muted mt-1">Spend Dashboard — acesso restrito</p>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">E-mail</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Senha</label>
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm"
          />
        </div>
        {err && <p className="text-xs text-danger">{err}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-accent text-white rounded py-2 text-sm font-semibold hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
