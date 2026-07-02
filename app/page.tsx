"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/lib/types";
import { parseStatement } from "@/lib/parsers";
import { categorizeAll } from "@/lib/categorize";
import { analyze } from "@/lib/analyze";
import { loadTransactions, saveTransactions, clearTransactions } from "@/lib/storage";
import UploadZone from "@/components/UploadZone";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // carrega do navegador ao abrir
  useEffect(() => {
    setTxs(loadTransactions());
    setLoaded(true);
  }, []);

  // salva sempre que mudar
  useEffect(() => {
    if (loaded) saveTransactions(txs);
  }, [txs, loaded]);

  const analysis = useMemo(() => (txs.length ? analyze(txs) : null), [txs]);

  function dedupe(list: Transaction[]): Transaction[] {
    const seen = new Set<string>();
    const out: Transaction[] = [];
    for (const t of list) {
      const key = `${t.date}|${t.amount}|${t.description.slice(0, 24)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
    }
    return out;
  }

  function handleFile(filename: string, text: string) {
    try {
      const parsed = parseStatement(filename, text);
      if (parsed.length === 0) {
        showToast("Não encontrei transações nesse arquivo. Tente exportar como OFX ou CSV.");
        return;
      }
      const categorized = categorizeAll(parsed);
      setTxs((prev) => dedupe([...prev, ...categorized]));
      showToast(`${parsed.length} transações importadas de ${filename}.`);
    } catch (e) {
      showToast("Não consegui ler esse arquivo. Confira se é um OFX ou CSV válido.");
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  function reset() {
    if (confirm("Isso apaga todos os dados salvos no seu navegador. Continuar?")) {
      clearTransactions();
      setTxs([]);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Meu Extrato
          </h1>
          <p className="mt-1 text-sm text-ink-dim">
            Suba o extrato e veja, sem enrolação, para onde vai o seu dinheiro.
          </p>
        </div>
        {analysis && (
          <div className="flex items-center gap-2">
            <UploadZone onFile={handleFile} compact />
            <button
              onClick={reset}
              className="rounded-xl border border-line px-4 py-2 text-sm text-ink-faint transition hover:border-alert/50 hover:text-alert"
            >
              Limpar tudo
            </button>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {!analysis ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-xl pt-6"
          >
            <UploadZone onFile={handleFile} />
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-ink-faint">
              <div className="card p-4">
                <p className="font-display text-lg text-ink">1</p>
                <p className="mt-1">Exporte o extrato do seu banco em OFX ou CSV</p>
              </div>
              <div className="card p-4">
                <p className="font-display text-lg text-ink">2</p>
                <p className="mt-1">Solte o arquivo aqui — tudo é lido no seu navegador</p>
              </div>
              <div className="card p-4">
                <p className="font-display text-lg text-ink">3</p>
                <p className="mt-1">Veja onde está gastando demais</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dash"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard a={analysis} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-line bg-surface px-5 py-3 text-sm text-ink shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-ink-faint">
        Seus dados ficam salvos apenas neste navegador. Nada é enviado para servidores.
      </footer>
    </main>
  );
}
