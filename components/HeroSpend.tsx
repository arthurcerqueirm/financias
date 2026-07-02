"use client";

import { motion } from "framer-motion";
import { CategorySummary } from "@/lib/types";
import { brl, pct } from "@/lib/format";
import CountUp from "./CountUp";

type Props = {
  categorias: CategorySummary[];
  totalGasto: number;
};

export default function HeroSpend({ categorias, totalGasto }: Props) {
  const top = categorias.slice(0, 6);
  const max = top.length ? top[0].total : 1;
  const leader = top[0];

  return (
    <div className="card overflow-hidden p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-dim">
          Para onde vai o seu dinheiro
        </span>
        {leader && (
          <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            Você gasta mais em{" "}
            <span style={{ color: leader.color }}>{leader.category}</span>
          </h2>
        )}
        {leader && (
          <p className="tnum mt-1 text-4xl font-bold md:text-5xl" style={{ color: leader.color }}>
            <CountUp value={leader.total} format={brl} />
            <span className="ml-2 align-middle text-lg font-medium text-ink-dim">
              {pct(leader.share)} do total
            </span>
          </p>
        )}
      </div>

      <div className="mt-7 space-y-3.5">
        {top.map((c, i) => (
          <div key={c.category} className="group">
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className="font-medium text-ink">{c.category}</span>
              <span className="tnum text-ink-dim">
                {brl(c.total)} <span className="text-ink-faint">· {pct(c.share)}</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(c.total / max) * 100}%` }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ background: c.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
