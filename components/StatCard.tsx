"use client";

import { motion } from "framer-motion";
import CountUp from "./CountUp";
import { brl } from "@/lib/format";

type Props = {
  label: string;
  value: number;
  accent?: string;
  delay?: number;
  sub?: string;
  money?: boolean;
};

export default function StatCard({ label, value, accent = "#EDF1F7", delay = 0, sub, money = true }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card p-5"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-ink-dim">{label}</p>
      <p className="tnum mt-2 text-3xl font-semibold" style={{ color: accent }}>
        <CountUp value={value} format={money ? brl : undefined} />
      </p>
      {sub && <p className="mt-1 text-xs text-ink-faint">{sub}</p>}
    </motion.div>
  );
}
