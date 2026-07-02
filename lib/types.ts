export type Transaction = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  amount: number; // negativo = saída/gasto, positivo = entrada
  category: string;
};

export type CategorySummary = {
  category: string;
  total: number; // valor absoluto gasto
  count: number;
  share: number; // fração do total de gastos (0..1)
  color: string;
};

export type MonthlyPoint = {
  month: string; // yyyy-mm
  label: string; // "jan/25"
  gastos: number;
  receitas: number;
};

export type DailyPoint = {
  date: string;
  label: string;
  gastos: number;
};

export type Insight = {
  kind: "alerta" | "assinatura" | "outlier" | "info";
  title: string;
  detail: string;
  value?: number;
};

export type Analysis = {
  totalGasto: number;
  totalReceita: number;
  saldo: number;
  numTransacoes: number;
  periodo: { inicio: string; fim: string; meses: number };
  categorias: CategorySummary[];
  topGastos: Transaction[];
  porMes: MonthlyPoint[];
  porDia: DailyPoint[];
  insights: Insight[];
  mediaGastoDiario: number;
};
