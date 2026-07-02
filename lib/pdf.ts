import { Transaction } from "./types";
import { parseBRNumber } from "./parsers";
import { categorizeOne } from "./categorize";

// ---------------------------------------------------------------
// Extração de texto do PDF (roda no navegador, com pdf.js).
// Agrupa os fragmentos por posição vertical para reconstruir cada linha.
// ---------------------------------------------------------------

export async function extractLinesFromPDF(buffer: ArrayBuffer): Promise<string[]> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf");
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const allLines: string[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();

    const rows = new Map<number, { x: number; s: string }[]>();
    for (const item of content.items as any[]) {
      if (!item.str || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      let key = y;
      for (const k of rows.keys()) {
        if (Math.abs(k - y) <= 2) {
          key = k;
          break;
        }
      }
      const arr = rows.get(key) || [];
      arr.push({ x: item.transform[4], s: item.str });
      rows.set(key, arr);
    }

    const sortedY = Array.from(rows.keys()).sort((a, b) => b - a);
    for (const y of sortedY) {
      const parts = rows.get(y)!.sort((a, b) => a.x - b.x);
      const line = parts.map((pp) => pp.s).join(" ").replace(/\s+/g, " ").trim();
      if (line) allLines.push(line);
    }
  }

  return allLines;
}

// ---------------------------------------------------------------
// Interpretação das linhas → transações.
// ---------------------------------------------------------------

// Data: exige "/" ou "-" (assim não confunde com o ponto de milhar de
// valores como 1.055,45). O ano é opcional — faturas costumam só ter dd/mm.
const DATE_RE = /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/;
// Valores no padrão brasileiro: 1.234,56 / -58,90 / 58,90 D / R$ 89,00
const MONEY_RE =
  /-?\s*R?\$?\s*\d{1,3}(?:\.\d{3})*,\d{2}(?:\s*[DCdc]\b)?|-?\s*R?\$?\s*\d+,\d{2}(?:\s*[DCdc]\b)?/g;

// Linhas que são resumo/cabeçalho, não transações.
const SKIP = [
  "saldo anterior", "saldo do dia", "saldo em conta", "saldo final",
  "total da fatura", "limite", "vencimento", "pagamento minimo",
  "saldo disponivel", "fatura anterior", "melhor dia",
];

let pdfIdCounter = 0;
function makeId(): string {
  pdfIdCounter += 1;
  return `pdf_${Date.now().toString(36)}_${pdfIdCounter}`;
}

function pdfDate(m: RegExpMatchArray): string | null {
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  let y: number;
  if (m[3]) {
    y = m[3].length === 2 ? 2000 + parseInt(m[3], 10) : parseInt(m[3], 10);
  } else {
    y = new Date().getFullYear();
  }
  if (d < 1 || d > 31 || mo < 1 || mo > 12) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Em PDF os gastos costumam vir SEM sinal. Decide entrada(+)/saida(-) por
// indicadores (D/C, sinal) e, na falta deles, pelo texto da linha. O padrão
// é GASTO, já que a maioria das linhas de extrato/fatura são saídas.
const CREDIT_HINTS = [
  "pagamento", "estorno", "salario", "deposito", "credito", "rendimento",
  "recebid", "reembolso", "cashback", "provento", "restituic", "devolucao",
];

function resolveSign(valueStr: string, line: string, magnitude: number): number {
  const v = valueStr.trim().toLowerCase();
  const hasDebit = v.startsWith("-") || /\bd\b\s*$/.test(v);
  const hasCredit = /\bc\b\s*$/.test(v) || v.includes("+");
  if (hasDebit) return -Math.abs(magnitude);
  if (hasCredit) return Math.abs(magnitude);

  const norm = line.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const looksCredit = CREDIT_HINTS.some((h) => norm.includes(h));
  return looksCredit ? Math.abs(magnitude) : -Math.abs(magnitude);
}

export function parsePDFText(lines: string[]): Transaction[] {
  let twoValueLines = 0;
  let oneValueLines = 0;
  const candidates: { line: string; date: string; monies: string[] }[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const norm = line.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (SKIP.some((s) => norm.includes(s))) continue;

    const dateMatch = line.match(DATE_RE);
    if (!dateMatch) continue;
    const iso = pdfDate(dateMatch);
    if (!iso) continue;

    const monies = line.match(MONEY_RE);
    if (!monies || monies.length === 0) continue;

    if (monies.length >= 2) twoValueLines++;
    else oneValueLines++;
    candidates.push({ line, date: iso, monies });
  }

  // Se a maioria das linhas tem 2 valores, o último é o saldo → usa o penúltimo.
  const saldoNaUltima = twoValueLines > oneValueLines && twoValueLines > 0;

  const txs: Transaction[] = [];
  for (const c of candidates) {
    const valueStr =
      saldoNaUltima && c.monies.length >= 2
        ? c.monies[c.monies.length - 2]
        : c.monies[c.monies.length - 1];

    const magnitude = parseBRNumber(valueStr);
    if (magnitude == null || magnitude === 0) continue;
    const amount = resolveSign(valueStr, c.line, magnitude);

    let desc = c.line
      .replace(DATE_RE, "")
      .replace(MONEY_RE, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!desc || desc.length < 2) desc = "Sem descrição";

    const tx: Transaction = { id: makeId(), date: c.date, description: desc, amount, category: "" };
    tx.category = categorizeOne(tx);
    txs.push(tx);
  }

  return txs;
}

export async function parsePDF(buffer: ArrayBuffer): Promise<Transaction[]> {
  const lines = await extractLinesFromPDF(buffer);
  return parsePDFText(lines);
}
