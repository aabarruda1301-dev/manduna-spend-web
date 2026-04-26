-- =========================================================
-- Manduna Spend — Setup do banco no Supabase
-- Cole este SQL no editor do Supabase (SQL Editor)
-- e depois importe o CSV transactions_master.csv pelo Table Editor
-- =========================================================

-- Tabela principal
CREATE TABLE IF NOT EXISTS public.transactions (
  id            BIGSERIAL PRIMARY KEY,
  sheet_number  INTEGER,
  sheet_name    TEXT NOT NULL,
  category      TEXT,
  txn_date      DATE NOT NULL,
  year          INTEGER,
  month         INTEGER,
  month_year    TEXT,
  supplier      TEXT,
  department    TEXT,
  description   TEXT,
  quantity      NUMERIC,
  unit_price    NUMERIC,
  total_amount  NUMERIC
);

-- Índices para acelerar filtros e drill-down
CREATE INDEX IF NOT EXISTS idx_txn_sheet      ON public.transactions(sheet_name);
CREATE INDEX IF NOT EXISTS idx_txn_date       ON public.transactions(txn_date);
CREATE INDEX IF NOT EXISTS idx_txn_ym         ON public.transactions(month_year);
CREATE INDEX IF NOT EXISTS idx_txn_supplier   ON public.transactions(supplier);
CREATE INDEX IF NOT EXISTS idx_txn_department ON public.transactions(department);

-- Tabela de fornecedores (lista oficial — opcional)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id   INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS)
-- Garante que apenas usuários autenticados leem os dados
-- =========================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers    ENABLE ROW LEVEL SECURITY;

-- Política: qualquer usuário logado pode SELECT
DROP POLICY IF EXISTS "auth_read_transactions" ON public.transactions;
CREATE POLICY "auth_read_transactions" ON public.transactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_read_suppliers" ON public.suppliers;
CREATE POLICY "auth_read_suppliers" ON public.suppliers
  FOR SELECT TO authenticated USING (true);
