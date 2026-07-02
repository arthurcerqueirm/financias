import { NextResponse } from "next/server";
import { getServerSupabase, isConfigured, TABLE } from "@/lib/supabase";
import { Transaction } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// gera uma chave única por transação para evitar duplicatas no banco
function hashOf(t: { date: string; amount: number; description: string }): string {
  return `${t.date}|${t.amount.toFixed(2)}|${t.description.slice(0, 40).trim().toLowerCase()}`;
}

// GET: devolve todas as transações salvas
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, transactions: [] });
  }
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, data, descricao, valor, categoria")
      .order("data", { ascending: true });

    if (error) throw error;

    const transactions: Transaction[] = (data || []).map((r) => ({
      id: r.id,
      date: r.data,
      description: r.descricao,
      amount: Number(r.valor),
      category: r.categoria,
    }));

    return NextResponse.json({ configured: true, transactions });
  } catch (e: any) {
    return NextResponse.json(
      { configured: true, transactions: [], error: e.message },
      { status: 500 }
    );
  }
}

// POST: insere um lote de transações (ignora as que já existem)
export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Banco não configurado." },
      { status: 200 }
    );
  }
  try {
    const body = (await req.json()) as Transaction[];
    if (!Array.isArray(body)) throw new Error("Formato inválido.");

    const rows = body.map((t) => ({
      data: t.date,
      descricao: t.description,
      valor: t.amount,
      categoria: t.category || "Outros",
      hash: hashOf(t),
    }));

    const supabase = getServerSupabase();
    const { error } = await supabase
      .from(TABLE)
      .upsert(rows, { onConflict: "hash", ignoreDuplicates: true });

    if (error) throw error;
    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// DELETE: apaga todas as transações
export async function DELETE() {
  if (!isConfigured()) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
  try {
    const supabase = getServerSupabase();
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
