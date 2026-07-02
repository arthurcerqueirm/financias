# Meu Extrato — dashboard de gastos

Suba o extrato do seu banco (PDF, OFX ou CSV) e veja, com clareza e animações, para onde vai o seu dinheiro e onde você pode estar gastando demais. As transações ficam salvas num banco de dados **Supabase**.

- Lê extratos em **PDF**, **OFX** e **CSV**
- Categoriza tudo automaticamente (Alimentação, Mercado, Transporte, Moradia, Assinaturas, Tarifas...)
- Dashboard com cards animados, donut de categorias, tendência mês a mês, gastos por dia e maiores gastos
- Painel de **alertas**: categoria dominante, cobranças recorrentes, gastos fora do padrão, tarifas e juros
- Dados salvos no **Supabase** (Postgres), sincronizados entre celular e computador
- Deduplicação automática: subir o mesmo extrato duas vezes não gera transações repetidas

## Banco de dados — já está configurado

A tabela `extrato_transacoes` já foi criada no seu projeto Supabase
(`aiclengvpifvdqhqvpme`, região São Paulo). Você só precisa informar ao app
duas variáveis de ambiente:

| Variável | Onde encontrar |
|---|---|
| `SUPABASE_URL` | Já é `https://aiclengvpifvdqhqvpme.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → seu projeto → **Project Settings → API Keys → `service_role`** (é uma chave secreta) |

A chave `service_role` é **secreta**: ela só é usada no servidor e nunca chega ao
navegador. Não a suba para o GitHub nem a cole em lugar público.

### Segurança dos seus dados

A tabela está com **Row Level Security ligado e sem policies públicas**. Na prática:
o único jeito de ler ou gravar é pelo servidor do app, que usa a chave secreta.
Mesmo que alguém descubra a URL do seu Supabase, não consegue ver seus dados.

## Rodar no seu computador

Precisa do Node.js 18+.

```bash
npm install
cp .env.example .env.local     # depois edite .env.local com sua service_role key
npm run dev
```

Abra `http://localhost:3000`.

## Subir na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com): **Add New → Project → Import** do seu repositório.
3. Antes de finalizar, em **Environment Variables**, adicione:
   - `SUPABASE_URL` = `https://aiclengvpifvdqhqvpme.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = sua chave secreta do Supabase
4. Clique em **Deploy**. Em poucos minutos você recebe a URL pública.

Se esquecer as variáveis, o app ainda abre, mas mostra um aviso e não salva nada.

## Como exportar o extrato do seu banco

Quase todo banco (Nubank, Inter, Itaú, Bradesco, C6...) tem, na tela do extrato
ou da fatura, um botão de **exportar/baixar**. Prefira **OFX** ou **CSV** quando
existir (a leitura é mais precisa). O **PDF** também funciona — o app extrai o
texto e identifica as transações.

### Sobre PDF

A leitura de PDF cobre a maioria dos extratos e faturas, mas cada banco tem um
layout diferente. Se as transações não vierem certas com o seu banco:

- Confira se o PDF tem texto selecionável (PDFs escaneados/foto não têm texto e
  não podem ser lidos sem OCR).
- O "cérebro" da leitura está em `lib/pdf.ts` — dá para ajustar as regras para o
  formato do seu banco.

## Arquivos de exemplo

Na pasta `exemplos/` há um `extrato-exemplo.csv` e um `extrato-exemplo.ofx` para testar.

## Estrutura

```
app/
  page.tsx          tela principal (upload + dashboard)
  api/data/route.ts API que lê/grava no Supabase (GET, POST, DELETE)
components/          gráficos, cards, upload
lib/
  parsers.ts        leitura de OFX e CSV
  pdf.ts            leitura de PDF (pdf.js + heurística)
  categorize.ts     categorização automática (palavras-chave PT-BR)
  analyze.ts        cálculos e alertas de gasto excessivo
  supabase.ts       cliente do banco (server)
  storage.ts        chamadas à API + cache local
exemplos/           extratos de teste
```

## Ajustar categorias

O dicionário de categorias está em `lib/categorize.ts`. Se algum gasto cair em
"Outros", adicione a palavra-chave na categoria certa.
