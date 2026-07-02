import Papa from "papaparse";
import { Transaction } from "./types";

// ---------- helpers de normalização (formato BR) ----------

/** Converte "1.234,56" / "1234.56" / "-R$ 89,90" em número. */
export function parseBRNumber(raw: string): number | null {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s) return null;

  // guarda sinal de débito por parênteses ou "D"
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (/\bD$/i.test(s) || /^D\b/i.test(s)) negative = true;
  const hadC = /\bC$/i.test(s);

  // remove tudo que não for dígito, vírgula, ponto ou sinal
  s = s.replace(/[R$\s]/gi, "").replace(/[CDcd]$/i, "").trim();
  const sign = s.startsWith("-") ? -1 : 1;
  s = s.replace(/[^0-9.,-]/g, "");

  if (!s || s === "-" || s === "." || s === ",") return null;

  // decide separador decimal: o último entre , e . é o decimal
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > lastDot) {
    // vírgula é decimal → remove pontos de milhar, troca vírgula por ponto
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    // ponto é decimal → remove vírgulas de milhar
    s = s.replace(/,/g, "");
  } else {
    s = s.replace(/,/g, "");
  }

  let n = parseFloat(s);
  if (Number.isNaN(n)) return null;
  n = Math.abs(n) * sign;
  if (negative) n = -Math.abs(n);
  if (hadC) n = Math.abs(n);
  return n;
}

/** Converte várias formas de data em ISO yyyy-mm-dd. */
export function parseDate(raw: string): string | null {
  if (!raw) return null;
  const s = String(raw).trim();

  // OFX: 20250131 ou 20250131120000[-3:BRT]
  let m = s.match(/^(\d{4})(\d{2})(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  // dd/mm/yyyy ou dd-mm-yyyy ou dd.mm.yyyy
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = (parseInt(y) > 70 ? "19" : "20") + y;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // yyyy-mm-dd
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

let idCounter = 0;
function makeId(): string {
  idCounter += 1;
  return `tx_${Date.now().toString(36)}_${idCounter}`;
}

// ---------- OFX ----------

export function parseOFX(text: string): Transaction[] {
  const txs: Transaction[] = [];
  const blocks = text.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || [];

  const tag = (block: string, name: string): string => {
    const re = new RegExp(`<${name}>([^<\\r\\n]*)`, "i");
    const mm = block.match(re);
    return mm ? mm[1].trim() : "";
  };

  for (const block of blocks) {
    const amountRaw = tag(block, "TRNAMT");
    const dateRaw = tag(block, "DTPOSTED");
    const memo = tag(block, "MEMO");
    const name = tag(block, "NAME");
    const amount = parseBRNumber(amountRaw);
    const date = parseDate(dateRaw);
    if (amount == null || date == null) continue;
    const description = (name || memo || "Sem descrição").trim();
    txs.push({ id: makeId(), date, description, amount, category: "" });
  }
  return txs;
}

// ---------- CSV ----------

const DATE_KEYS = ["data", "date", "dt", "dia", "lançamento", "lancamento"];
const DESC_KEYS = [
  "descri", "histor", "histó", "lançamento", "lancamento", "detalhe",
  "estabelecimento", "titulo", "título", "title", "memo", "name", "nome",
];
const AMOUNT_KEYS = ["valor", "amount", "value", "montante", "quantia"];
const CREDIT_KEYS = ["crédito", "credito", "credit", "entrada"];
const DEBIT_KEYS = ["débito", "debito", "debit", "saída", "saida"];

function findKey(headers: string[], candidates: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const cand of candidates) {
    const idx = lower.findIndex((h) => h.includes(cand));
    if (idx >= 0) return headers[idx];
  }
  return null;
}

export function parseCSV(text: string): Transaction[] {
  // detecta delimitador simples
  const firstLine = text.split(/\r?\n/)[0] || "";
  const semis = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const delimiter = semis > commas ? ";" : ",";

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    delimiter,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const rows = parsed.data.filter((r) => r && Object.keys(r).length > 0);
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const dateKey = findKey(headers, DATE_KEYS);
  const descKey = findKey(headers, DESC_KEYS);
  const amountKey = findKey(headers, AMOUNT_KEYS);
  const creditKey = findKey(headers, CREDIT_KEYS);
  const debitKey = findKey(headers, DEBIT_KEYS);

  const txs: Transaction[] = [];

  for (const row of rows) {
    const date = dateKey ? parseDate(row[dateKey]) : null;
    if (!date) continue;

    let amount: number | null = null;

    if (amountKey && row[amountKey]) {
      amount = parseBRNumber(row[amountKey]);
      // alguns bancos têm coluna separada indicando tipo
      const tipo = (row["tipo"] || row["Tipo"] || "").toLowerCase();
      if (amount != null && (tipo.includes("déb") || tipo.includes("deb") || tipo.includes("saída") || tipo.includes("saida"))) {
        amount = -Math.abs(amount);
      }
    } else if (creditKey || debitKey) {
      const cred = creditKey ? parseBRNumber(row[creditKey]) : null;
      const deb = debitKey ? parseBRNumber(row[debitKey]) : null;
      if (deb && Math.abs(deb) > 0) amount = -Math.abs(deb);
      else if (cred && Math.abs(cred) > 0) amount = Math.abs(cred);
    }

    if (amount == null) continue;

    const description = descKey
      ? (row[descKey] || "").trim() || "Sem descrição"
      : "Sem descrição";

    txs.push({ id: makeId(), date, description, amount, category: "" });
  }

  return txs;
}

// ---------- dispatcher ----------

export function parseStatement(filename: string, text: string): Transaction[] {
  const lower = filename.toLowerCase();
  const looksOFX = /<OFX>/i.test(text) || /<STMTTRN>/i.test(text) || lower.endsWith(".ofx");
  if (looksOFX) return parseOFX(text);
  return parseCSV(text);
}
