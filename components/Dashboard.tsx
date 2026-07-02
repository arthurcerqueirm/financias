"use client";

import { Analysis } from "@/lib/types";
import StatCard from "./StatCard";
import HeroSpend from "./HeroSpend";
import CategoryDonut from "./CategoryDonut";
import TrendChart from "./TrendChart";
import DailyBars from "./DailyBars";
import InsightsPanel from "./InsightsPanel";
import TopSpends from "./TopSpends";
import { brl } from "@/lib/format";

export default function Dashboard({ a }: { a: Analysis }) {
  const periodoStr =
    a.periodo.inicio && a.periodo.fim
      ? `${a.periodo.inicio.split("-").reverse().join("/")} — ${a.periodo.fim.split("-").reverse().join("/")}`
      : "";

  return (
    <div className="space-y-5">
      {/* cards de topo */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total gasto" value={a.totalGasto} accent="#FF6B5C" delay={0} sub={periodoStr} />
        <StatCard label="Total recebido" value={a.totalReceita} accent="#3DDC97" delay={0.06} />
        <StatCard
          label="Saldo"
          value={a.saldo}
          accent={a.saldo >= 0 ? "#3DDC97" : "#FF6B5C"}
          delay={0.12}
          sub={a.saldo >= 0 ? "sobrou no período" : "faltou no período"}
        />
        <StatCard
          label="Média por dia"
          value={a.mediaGastoDiario}
          accent="#FFB020"
          delay={0.18}
          sub={`${a.numTransacoes} transações`}
        />
      </div>

      {/* herói + insights */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <HeroSpend categorias={a.categorias} totalGasto={a.totalGasto} />
        </div>
        <div className="lg:col-span-2">
          <InsightsPanel insights={a.insights} />
        </div>
      </div>

      {/* donut + tendência */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CategoryDonut categorias={a.categorias} />
        {a.porMes.length > 1 ? (
          <TrendChart porMes={a.porMes} />
        ) : (
          <TopSpends topGastos={a.topGastos} />
        )}
      </div>

      {/* barras diárias + (top gastos se houver tendência acima) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <DailyBars porDia={a.porDia} />
        {a.porMes.length > 1 && <TopSpends topGastos={a.topGastos} />}
      </div>
    </div>
  );
}
