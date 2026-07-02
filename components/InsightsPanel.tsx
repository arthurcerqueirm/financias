"use client";

import { motion } from "framer-motion";
import { Insight } from "@/lib/types";

const STYLES: Record<Insight["kind"], { color: string; bg: string; label: string; icon: string }> = {
  alerta: { color: "#FF6B5C", bg: "rgba(255,107,92,0.10)", label: "Atenção", icon: "!" },
  assinatura: { color: "#F472B6", bg: "rgba(244,114,182,0.10)", label: "Recorrente", icon: "↻" },
  outlier: { color: "#FFB020", bg: "rgba(255,176,32,0.10)", label: "Fora do padrão", icon: "▲" },
  info: { color: "#5B9DFF", bg: "rgba(91,157,255,0.10)", label: "Nota", icon: "i" },
};

export default function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null;
  return (
    <div className="card p-6">
      <h3 className="mb-1 font-display text-base font-semibold text-ink">
        Onde você pode estar gastando demais
      </h3>
      <p className="mb-5 text-xs text-ink-dim">Pontos que valem sua atenção neste período.</p>
      <div className="space-y-3">
        {insights.map((ins, i) => {
          const s = STYLES[ins.kind];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex gap-3 rounded-2xl border border-line p-4"
              style={{ background: s.bg }}
            >
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                style={{ background: s.color, color: "#0A0E16" }}
              >
                {s.icon}
              </div>
              <div>
                <div className="mb-0.5 flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: s.color, background: "rgba(255,255,255,0.04)" }}
                  >
                    {s.label}
                  </span>
                </div>
                <p className="font-medium text-ink">{ins.title}</p>
                <p className="mt-0.5 text-sm text-ink-dim">{ins.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
