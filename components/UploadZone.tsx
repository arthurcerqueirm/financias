"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  onFile: (file: File) => void;
  compact?: boolean;
  busy?: boolean;
};

export default function UploadZone({ onFile, compact, busy }: Props) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onFile(files[0]);
    },
    [onFile]
  );

  if (compact) {
    return (
      <>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-xl border border-line bg-surface-2 px-4 py-2 text-sm font-medium text-ink-dim transition hover:text-ink hover:border-ink-faint disabled:opacity-50"
        >
          {busy ? "Processando..." : "+ Adicionar outro extrato"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".ofx,.csv,.txt,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !busy && inputRef.current?.click()}
      className={`card cursor-pointer p-10 text-center transition ${
        drag ? "border-alert/60 bg-surface-2" : "hover:border-ink-faint"
      } ${busy ? "pointer-events-none opacity-70" : ""}`}
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
        {busy ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-faint border-t-alert" />
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-alert">
            <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">
        {busy ? "Lendo seu extrato..." : "Solte seu extrato aqui"}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-dim">
        Arraste o arquivo ou clique para escolher. Aceita{" "}
        <strong className="text-ink">PDF</strong>,{" "}
        <strong className="text-ink">OFX</strong> e{" "}
        <strong className="text-ink">CSV</strong>.
      </p>
      <p className="mt-4 text-xs text-ink-faint">
        O arquivo é lido no seu navegador; só as transações extraídas vão para o seu banco.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".ofx,.csv,.txt,.pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.div>
  );
}
