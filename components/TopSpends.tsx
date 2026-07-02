"use client";

import { motion } from "framer-motion";
import { Transaction } from "@/lib/types";
import { brl } from "@/lib/format";
import { categoryColor } from "@/lib/categorize";

export default function TopSpends({ topGastos }: { topGastos: Transaction[] }) {
  return (
    <div className="card p-6">
      <h3 className="mb-1 font-display text-base font-semibold text-ink">Maiores gastos</h3>
      <p className="mb-4 text-xs text-ink-dim">As transações individuais que mais pesaram.</p>
      <ul className="space-y-1">
        {topGastos.map((t, i) => (
          <motion.li
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-surface-2"
          >
            <span
              className="h-8 w-1 shrink-0 rounded-full"
              style={{ background: categoryColor(t.category) }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{t.description}</p>
              <p className="text-xs text-ink-faint">
                {t.date.split("-").reverse().join("/")} · {t.category}
              </p>
            </div>
            <span className="tnum shrink-0 text-sm font-semibold text-alert">
              {brl(Math.abs(t.amount))}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
