import { createClient } from "@supabase/supabase-js";

// Cliente usado APENAS no servidor (API routes).
// Usa a service_role key, que fica em variável de ambiente na Vercel e
// nunca chega ao navegador. Assim os dados do extrato ficam protegidos:
// mesmo que alguém descubra a URL do Supabase, sem essa chave secreta
// não consegue ler nada (a tabela está com RLS ligado e sem policies).

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getServerSupabase() {
  if (!url || !serviceKey) {
    throw new Error(
      "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export function isConfigured(): boolean {
  return Boolean(url && serviceKey);
}

export const TABLE = "extrato_transacoes";
