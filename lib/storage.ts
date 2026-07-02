import { Transaction } from "./types";

const KEY = "extrato-dashboard:transacoes:v1";

// -------------------------------------------------------------------
// Persistência LOCAL (padrão): salva no navegador do usuário.
// Vantagens: privado (o extrato nunca sai do seu dispositivo), zero
// configuração, funciona offline. É a opção recomendada para uso pessoal.
// -------------------------------------------------------------------

export function saveTransactions(txs: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(txs));
  } catch (e) {
    console.error("Falha ao salvar no navegador:", e);
  }
}

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearTransactions(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

// -------------------------------------------------------------------
// OPCIONAL: persistência na Vercel via Vercel Blob (sincroniza entre
// dispositivos). Para ativar:
//   1. npm install @vercel/blob
//   2. No painel da Vercel: Storage → Create → Blob, conecte ao projeto
//   3. Descomente a rota em app/api/data/route.ts
//   4. Troque as chamadas acima por saveRemote/loadRemote abaixo
// -------------------------------------------------------------------

export async function saveRemote(txs: Transaction[]): Promise<void> {
  await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(txs),
  });
}

export async function loadRemote(): Promise<Transaction[]> {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
