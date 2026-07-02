import { Transaction } from "./types";

// -------------------------------------------------------------------
// Persistência no banco (Supabase) via API routes do próprio app.
// O navegador nunca fala direto com o banco: ele chama /api/data, e o
// servidor (com a chave secreta) é quem lê e grava. Assim os dados
// ficam salvos de verdade e sincronizam entre dispositivos.
// -------------------------------------------------------------------

export type LoadResult = {
  configured: boolean;
  transactions: Transaction[];
};

export async function loadFromDB(): Promise<LoadResult> {
  try {
    const res = await fetch("/api/data", { cache: "no-store" });
    const json = await res.json();
    return {
      configured: Boolean(json.configured),
      transactions: Array.isArray(json.transactions) ? json.transactions : [],
    };
  } catch {
    return { configured: false, transactions: [] };
  }
}

export async function saveToDB(txs: Transaction[]): Promise<boolean> {
  try {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txs),
    });
    const json = await res.json();
    return Boolean(json.ok);
  } catch {
    return false;
  }
}

export async function clearDB(): Promise<boolean> {
  try {
    const res = await fetch("/api/data", { method: "DELETE" });
    const json = await res.json();
    return Boolean(json.ok);
  } catch {
    return false;
  }
}

// -------------------------------------------------------------------
// Cache local (opcional): guarda uma cópia no navegador para a tela
// abrir instantânea mesmo antes do banco responder.
// -------------------------------------------------------------------

const CACHE_KEY = "extrato-dashboard:cache:v2";

export function readCache(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeCache(txs: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(txs));
  } catch {
    /* ignora */
  }
}
