export function brl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function brlCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1000) {
    return (
      "R$ " +
      (n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) +
      "k"
    );
  }
  return brl(n);
}

export function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
