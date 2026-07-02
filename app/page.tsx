"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/lib/types";
import { parseStatement } from "@/lib/parsers";
import { parsePDF } from "@/lib/pdf";
import { categorizeAll } from "@/lib/categorize";
import { analyze } from "@/lib/analyze";
import { loadFromDB, saveToDB, clearDB, readCache, writeCache } from "@/lib/storage";
import UploadZone from "@/components/UploadZone";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [dbConfigured, setDbConfigured] = useState(true);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // carrega do banco ao abrir (mostra cache local enquanto responde)
  useEffect(() => {
    const cached = readCache();
    if (cached.length) setTxs(cached);
    (async () => {
      const res = await loadFromDB();
      setDbConfigured(res.configured);
      if (res.configured) {
        setTxs(res.transactions);
        writeCache(res.transactions);
      }
      setReady(true);
    })();
  }, []);

  const analysis = useMemo(() => (txs.length ? analyze(txs) : null), [txs]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  }

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const name = file.name.toLowerCase();
      let parsed: Transaction[] = [];

      if (name.endsWith(".pdf")) {
        const buf = await file.arrayBuffer();
        parsed = await parsePDF(buf);
      } else {
        const text = await file.text();
        parsed = parseStatement(file.name, text);
      }

      if (parsed.length === 0) {
        showToast("Não encontrei transações nesse arquivo. Se for um PDF de imagem/escaneado, o texto não pode ser lido.");
        return;
      }

      const categorized = categorizeAll(parsed);

      // otimista: atualiza a tela já
      const merged = dedupe([...txs, ...categorized]);
      setTxs(merged);
      writeCache(merged);

      // persiste no banco
      const ok = await saveToDB(categorized);
      if (ok) {
        // recarrega do banco para ter os ids reais e o dedup do servidor
        const res = await loadFromDB();
        if (res.configured) {
          setTxs(res.transactions);
          writeCache(res.transactions);
        }
        showToast(`${parsed.length} transações lidas de ${file.name} e salvas no banco.`);
      } else {
        showToast(`${parsed.length} transações lidas. Banco não configurado — veja o README para conectar o Supabase.`);
      }
    } catch (e) {
      showToast("Não consegui ler esse arquivo. Confira se é um PDF, OFX ou CSV válido.");
    } finally {
      setBusy(false);
    }
  }

  function dedupe(list: Transaction[]): Transaction[] {
    const seen = new Set<string>();
    const out: Transaction[] = [];
    for (const t of list) {
      const key = `${t.date}|${t.amount.toFixed(2)}|${t.description.slice(0, 40).toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
    }
    return out;
  }

  async function reset() {
    if (!confirm("Isso apaga todas as transações salvas no banco. Continuar?")) return;
    setBusy(true);
    await clearDB();
    setTxs([]);
    writeCache([]);
    setBusy(false);
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
            <UploadZone onFile={handleFile} compact busy={busy} />
            <button
              onClick={reset}
              disabled={busy}
              className="rounded-xl border border-line px-4 py-2 text-sm text-ink-faint transition hover:border-alert/50 hover:text-alert disabled:opacity-50"
            >
              Limpar tudo
            </button>
          </div>
        )}
      </header>

      {!dbConfigured && ready && (
        <div className="mb-6 rounded-2xl border border-amber/40 bg-amber/10 p-4 text-sm text-amber">
          O banco de dados ainda não está conectado. O app funciona, mas os dados
          não serão salvos. Veja o <strong>README</strong> para configurar as variáveis
          <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5">SUPABASE_URL</code>
          e
          <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>.
        </div>
      )}

      <AnimatePresence mode="wait">
        {!analysis ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-xl pt-6"
          >
            <UploadZone onFile={handleFile} busy={busy} />
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-ink-faint">
              <div className="card p-4">
                <p className="font-display text-lg text-ink">1</p>
                <p className="mt-1">Baixe o extrato do banco em PDF, OFX ou CSV</p>
              </div>
              <div className="card p-4">
                <p className="font-display text-lg text-ink">2</p>
                <p className="mt-1">Solte o arquivo aqui — as transações vão para o seu banco</p>
              </div>
              <div className="card p-4">
                <p className="font-display text-lg text-ink">3</p>
                <p className="mt-1">Veja onde está gastando demais</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 max-w-md rounded-xl border border-line bg-surface px-5 py-3 text-center text-sm text-ink shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-ink-faint">
        Seus dados ficam no seu próprio banco Supabase, acessível só pelo servidor com a chave secreta.
      </footer>
    </main>
  );
}
