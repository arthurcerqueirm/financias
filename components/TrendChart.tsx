"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { MonthlyPoint } from "@/lib/types";
import { brl, brlCompact } from "@/lib/format";

type Props = { porMes: MonthlyPoint[] };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-xl">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="tnum" style={{ color: p.color }}>
          {p.dataKey === "gastos" ? "Gastos" : "Receitas"}: {brl(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function TrendChart({ porMes }: Props) {
  return (
    <div className="card p-6">
      <h3 className="mb-1 font-display text-base font-semibold text-ink">Evolução mês a mês</h3>
      <p className="mb-4 text-xs text-ink-dim">Gastos contra receitas ao longo do tempo.</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={porMes} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="gGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B5C" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#FF6B5C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3DDC97" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3DDC97" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#232d42" vertical={false} />
            <XAxis dataKey="label" stroke="#5A657C" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#5A657C"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => brlCompact(v).replace("R$ ", "")}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(v) => (v === "gastos" ? "Gastos" : "Receitas")}
              wrapperStyle={{ fontSize: 12, color: "#8A96AC" }}
            />
            <Area
              type="monotone" dataKey="receitas" stroke="#3DDC97" strokeWidth={2}
              fill="url(#gReceitas)" animationDuration={900}
            />
            <Area
              type="monotone" dataKey="gastos" stroke="#FF6B5C" strokeWidth={2}
              fill="url(#gGastos)" animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
