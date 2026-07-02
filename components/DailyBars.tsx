"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DailyPoint } from "@/lib/types";
import { brl, brlCompact } from "@/lib/format";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-xl">
      <p className="font-medium text-ink">{label}</p>
      <p className="tnum text-alert">{brl(payload[0].value)}</p>
    </div>
  );
}

export default function DailyBars({ porDia }: { porDia: DailyPoint[] }) {
  // limita a exibição para no máximo os últimos 45 dias com gasto
  const data = porDia.slice(-45);
  const max = Math.max(...data.map((d) => d.gastos), 1);

  return (
    <div className="card p-6">
      <h3 className="mb-1 font-display text-base font-semibold text-ink">Gastos por dia</h3>
      <p className="mb-4 text-xs text-ink-dim">Os dias mais caros aparecem mais altos e mais quentes.</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232d42" vertical={false} />
            <XAxis dataKey="label" stroke="#5A657C" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis
              stroke="#5A657C" fontSize={11} tickLine={false} axisLine={false}
              tickFormatter={(v) => brlCompact(v).replace("R$ ", "")}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="gastos" radius={[4, 4, 0, 0]} animationDuration={800}>
              {data.map((d) => {
                const intensity = d.gastos / max;
                const color = intensity > 0.66 ? "#FF6B5C" : intensity > 0.33 ? "#FFB020" : "#5B9DFF";
                return <Cell key={d.date} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
