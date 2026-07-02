import { NextResponse } from "next/server";

// -------------------------------------------------------------------
// Rota OPCIONAL de persistência na Vercel usando Vercel Blob.
// Por padrão ela responde "não configurado" — o app funciona 100% com
// localStorage sem precisar disto.
//
// Para ativar a sincronização entre dispositivos:
//   1. npm install @vercel/blob
//   2. Painel da Vercel → Storage → Create Database → Blob → conectar
//      ao projeto (isso cria a env var BLOB_READ_WRITE_TOKEN)
//   3. Descomente o bloco marcado abaixo e apague o "stub"
//   4. Em lib/storage.ts, use saveRemote/loadRemote no lugar das
//      funções de localStorage
// -------------------------------------------------------------------

export const runtime = "nodejs";

// -------- STUB (padrão, sem dependências) --------
export async function GET() {
  return NextResponse.json([]);
}

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Persistência na Vercel não configurada. Usando localStorage." },
    { status: 200 }
  );
}

/* -------- VERSÃO VERCEL BLOB (descomente para usar) --------
import { put, list } from "@vercel/blob";

const BLOB_PATH = "extrato/transacoes.json";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (blobs.length === 0) return NextResponse.json([]);
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    await put(BLOB_PATH, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
*/
