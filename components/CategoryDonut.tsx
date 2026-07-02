"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CategorySummary } from "@/lib/types";
import { brl, pct } from "@/lib/format";

type Props = { categorias: CategorySummary[] };

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload as CategorySummary;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-xl">
      <p className="font-medium text-ink">{d.category}</p>
      <p className="tnum text-ink-dim">
        {brl(d.total)} · {pct(d.share)}
      </p>
    </div>
  );
}

export default function CategoryDonut({ categorias }: Props) {
  const data = categorias.slice(0, 8);
  return (
    <div className="card p-6">
      <h3 className="mb-1 font-display text-base font-semibold text-ink">Distribuição por categoria</h3>
      <p className="mb-4 text-xs text-ink-dim">Onde cada real foi parar.</p>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="h-52 w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2}
                stroke="none"
                animationDuration={900}
              >
                {data.map((d) => (
                  <Cell key={d.category} fill={d.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-2">
          {data.map((c) => (
            <li key={c.category} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-ink">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                {c.category}
              </span>
              <span className="tnum text-ink-dim">{pct(c.share)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
