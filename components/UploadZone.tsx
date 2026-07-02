"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  onFile: (filename: string, text: string) => void;
  compact?: boolean;
};

export default function UploadZone({ onFile, compact }: Props) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || "");
        onFile(file.name, text);
      };
      reader.readAsText(file, "utf-8");
    },
    [onFile]
  );

  if (compact) {
    return (
      <>
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-line bg-surface-2 px-4 py-2 text-sm font-medium text-ink-dim transition hover:text-ink hover:border-ink-faint"
        >
          + Adicionar outro extrato
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".ofx,.csv,.txt"
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
      onClick={() => inputRef.current?.click()}
      className={`card cursor-pointer p-10 text-center transition ${
        drag ? "border-alert/60 bg-surface-2" : "hover:border-ink-faint"
      }`}
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-alert">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">
        Solte seu extrato aqui
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-dim">
        Arraste o arquivo ou clique para escolher. Aceita <strong className="text-ink">.OFX</strong> e{" "}
        <strong className="text-ink">.CSV</strong> — os formatos que os bancos exportam.
      </p>
      <p className="mt-4 text-xs text-ink-faint">
        Seu extrato é lido no seu navegador e não sai do seu dispositivo.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".ofx,.csv,.txt"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.div>
  );
}
