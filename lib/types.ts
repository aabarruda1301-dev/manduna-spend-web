// Tipo de uma transação no banco (espelha a tabela `transactions` do Supabase)
export type Transaction = {
  id: number;
  sheet_number: number | null;
  sheet_name: string;
  category: string;
  txn_date: string;          // YYYY-MM-DD
  year: number;
  month: number;
  month_year: string;        // YYYY-MM
  supplier: string | null;
  department: string | null;
  description: string | null;
  quantity: number | null;
  unit_price: number | null;
  total_amount: number | null;
};

export type SummaryCategory = {
  num: number;
  name: string;       // ex: "37. Food Guest"
  hasDetail: boolean; // true se houver transações no banco para essa categoria
  monthly: (number | null)[]; // 15 valores (um por mês)
};

export type SummaryGroup = {
  name: string;
  categories: SummaryCategory[];
  totals: (number | null)[];
};

export type SummaryStructure = {
  months: string[];                            // 15 strings YYYY-MM
  topSummary: { label: string; values: (number | null)[] }[];
  topTotal: (number | null)[];
  groups: SummaryGroup[];
  grandTotal: (number | null)[];
};
