import { Transaction, Analysis, CategorySummary, MonthlyPoint, DailyPoint, Insight } from "./types";
import { categoryColor } from "./categorize";

const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTHS_PT[parseInt(m, 10) - 1]}/${y.slice(2)}`;
}

function dayLabel(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function analyze(txs: Transaction[]): Analysis {
  const gastos = txs.filter((t) => t.amount < 0);
  const receitas = txs.filter((t) => t.amount > 0);

  const totalGasto = gastos.reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalReceita = receitas.reduce((s, t) => s + t.amount, 0);
  const saldo = totalReceita - totalGasto;

  // período
  const dates = txs.map((t) => t.date).sort();
  const inicio = dates[0] || "";
  const fim = dates[dates.length - 1] || "";
  let meses = 1;
  if (inicio && fim) {
    const [ay, am] = inicio.split("-").map(Number);
    const [by, bm] = fim.split("-").map(Number);
    meses = Math.max(1, (by - ay) * 12 + (bm - am) + 1);
  }

  // categorias (só gastos)
  const catMap = new Map<string, { total: number; count: number }>();
  for (const t of gastos) {
    const cur = catMap.get(t.category) || { total: 0, count: 0 };
    cur.total += Math.abs(t.amount);
    cur.count += 1;
    catMap.set(t.category, cur);
  }
  const categorias: CategorySummary[] = Array.from(catMap.entries())
    .map(([category, v]) => ({
      category,
      total: v.total,
      count: v.count,
      share: totalGasto > 0 ? v.total / totalGasto : 0,
      color: categoryColor(category),
    }))
    .sort((a, b) => b.total - a.total);

  // top gastos individuais
  const topGastos = [...gastos]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 8);

  // por mês
  const monthMap = new Map<string, { gastos: number; receitas: number }>();
  for (const t of txs) {
    const ym = t.date.slice(0, 7);
    const cur = monthMap.get(ym) || { gastos: 0, receitas: 0 };
    if (t.amount < 0) cur.gastos += Math.abs(t.amount);
    else cur.receitas += t.amount;
    monthMap.set(ym, cur);
  }
  const porMes: MonthlyPoint[] = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({ month, label: monthLabel(month), gastos: v.gastos, receitas: v.receitas }));

  // por dia (só gastos)
  const dayMap = new Map<string, number>();
  for (const t of gastos) {
    dayMap.set(t.date, (dayMap.get(t.date) || 0) + Math.abs(t.amount));
  }
  const porDia: DailyPoint[] = Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, gastosDia]) => ({ date, label: dayLabel(date), gastos: gastosDia }));

  const diasComGasto = porDia.length || 1;
  const mediaGastoDiario = totalGasto / diasComGasto;

  const insights = buildInsights({ txs, gastos, categorias, totalGasto, meses, porMes });

  return {
    totalGasto,
    totalReceita,
    saldo,
    numTransacoes: txs.length,
    periodo: { inicio, fim, meses },
    categorias,
    topGastos,
    porMes,
    porDia,
    insights,
    mediaGastoDiario,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildInsights(ctx: {
  txs: Transaction[];
  gastos: Transaction[];
  categorias: CategorySummary[];
  totalGasto: number;
  meses: number;
  porMes: MonthlyPoint[];
}): Insight[] {
  const { gastos, categorias, totalGasto, meses, porMes } = ctx;
  const insights: Insight[] = [];

  // 1. Categoria dominante
  if (categorias.length > 0 && totalGasto > 0) {
    const top = categorias[0];
    if (top.share >= 0.3) {
      insights.push({
        kind: "alerta",
        title: `${top.category} consome ${Math.round(top.share * 100)}% dos seus gastos`,
        detail: `${fmt(top.total)} do total de ${fmt(totalGasto)}. É de longe onde mais sai dinheiro — vale olhar de perto.`,
        value: top.total,
      });
    } else {
      insights.push({
        kind: "info",
        title: `Maior gasto: ${top.category}`,
        detail: `${fmt(top.total)}, cerca de ${Math.round(top.share * 100)}% do total.`,
        value: top.total,
      });
    }
  }

  // 2. Assinaturas / recorrências (mesma descrição base repetida em meses diferentes)
  const recur = detectRecurring(gastos);
  for (const r of recur.slice(0, 3)) {
    insights.push({
      kind: "assinatura",
      title: `Cobrança recorrente: ${r.label}`,
      detail: `Apareceu ${r.times}x, ~${fmt(r.avg)} por vez. Assinaturas somam sem você perceber — confira se ainda usa.`,
      value: r.avg,
    });
  }

  // 3. Outliers: gastos individuais muito acima da média
  if (gastos.length > 5) {
    const valores = gastos.map((g) => Math.abs(g.amount));
    const media = valores.reduce((s, v) => s + v, 0) / valores.length;
    const maiores = [...gastos]
      .filter((g) => Math.abs(g.amount) > media * 4)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 2);
    for (const g of maiores) {
      insights.push({
        kind: "outlier",
        title: `Gasto fora do padrão: ${fmt(Math.abs(g.amount))}`,
        detail: `"${g.description}" em ${g.date.split("-").reverse().join("/")} — bem acima da sua média de ${fmt(media)} por transação.`,
        value: Math.abs(g.amount),
      });
    }
  }

  // 4. Tarifas e juros — dinheiro jogado fora
  const tarifas = categorias.find((c) => c.category === "Tarifas & Juros");
  if (tarifas && tarifas.total > 0) {
    insights.push({
      kind: "alerta",
      title: `Você pagou ${fmt(tarifas.total)} em tarifas e juros`,
      detail: `Isso é dinheiro que não virou nada. Muitas vezes dá para zerar trocando de conta ou evitando o rotativo.`,
      value: tarifas.total,
    });
  }

  // 5. Tendência de alta mês a mês
  if (porMes.length >= 2) {
    const ult = porMes[porMes.length - 1];
    const penult = porMes[porMes.length - 2];
    if (penult.gastos > 0 && ult.gastos > penult.gastos * 1.2) {
      const alta = Math.round(((ult.gastos - penult.gastos) / penult.gastos) * 100);
      insights.push({
        kind: "alerta",
        title: `Seus gastos subiram ${alta}% no último mês`,
        detail: `De ${fmt(penult.gastos)} em ${penult.label} para ${fmt(ult.gastos)} em ${ult.label}.`,
        value: ult.gastos,
      });
    }
  }

  return insights;
}

function baseLabel(desc: string): string {
  return desc
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\d+/g, "")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 3)
    .join(" ");
}

function detectRecurring(gastos: Transaction[]): { label: string; times: number; avg: number }[] {
  const map = new Map<string, { months: Set<string>; total: number; count: number; sample: string }>();
  for (const g of gastos) {
    const key = baseLabel(g.description);
    if (key.length < 3) continue;
    const cur = map.get(key) || { months: new Set<string>(), total: 0, count: 0, sample: g.description };
    cur.months.add(g.date.slice(0, 7));
    cur.total += Math.abs(g.amount);
    cur.count += 1;
    map.set(key, cur);
  }
  return Array.from(map.values())
    .filter((v) => v.months.size >= 2 && v.count >= 2)
    .map((v) => ({ label: v.sample.slice(0, 30), times: v.count, avg: v.total / v.count }))
    .sort((a, b) => b.avg * b.times - a.avg * a.times);
}
