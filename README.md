# Meu Extrato — dashboard de gastos

Suba o extrato do seu banco e veja, com clareza e animações, para onde está indo o seu dinheiro e onde você pode estar gastando demais.

- Lê extratos em **OFX** e **CSV** (os formatos que os bancos brasileiros exportam)
- Categoriza tudo automaticamente (Alimentação, Mercado, Transporte, Moradia, Assinaturas, Tarifas...)
- Dashboard com cards animados, donut de categorias, tendência mês a mês, gastos por dia e maiores gastos
- Painel de **alertas**: categoria dominante, cobranças recorrentes, gastos fora do padrão, tarifas e juros
- Os dados ficam **salvos no seu navegador** — o extrato nunca sai do seu dispositivo

## Como rodar no seu computador

Precisa do Node.js 18 ou superior instalado.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Como subir na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) (o plano grátis já serve).
2. Suba este projeto para um repositório no GitHub, ou use o comando abaixo:

```bash
npm install -g vercel
vercel
```

3. Siga as perguntas do terminal. Em poucos minutos você recebe uma URL pública.

Pelo painel da Vercel também dá: **Add New → Project → Import** do seu repositório GitHub. Não precisa configurar nada — a Vercel detecta que é Next.js sozinha.

## Onde os dados ficam salvos

Por padrão, tudo é salvo no **localStorage do seu navegador**. Isso significa:

- Seu extrato **não é enviado para servidor nenhum** — é lido e processado no próprio navegador.
- Os dados continuam lá quando você fecha e reabre a página.
- Se você limpar os dados do navegador, ou abrir em outro dispositivo, os dados não estarão lá.

### Quer sincronizar entre celular e computador?

Aí dá para usar o **Vercel Blob** (o jeito certo de "salvar arquivo na Vercel", já que o sistema de arquivos comum da Vercel é temporário). Passo a passo:

1. `npm install @vercel/blob`
2. No painel da Vercel: **Storage → Create Database → Blob** e conecte ao projeto. Isso cria automaticamente a variável `BLOB_READ_WRITE_TOKEN`.
3. Em `app/api/data/route.ts`, apague o bloco "STUB" e descomente o bloco "VERSÃO VERCEL BLOB".
4. Em `lib/storage.ts`, troque as chamadas de `saveTransactions`/`loadTransactions` por `saveRemote`/`loadRemote` (na `app/page.tsx`).

Feito isso, seus dados ficam guardados na Vercel e sincronizam entre dispositivos.

## Arquivos de exemplo

Na pasta `exemplos/` há um `extrato-exemplo.csv` e um `extrato-exemplo.ofx` para você testar o dashboard antes de usar seu extrato de verdade.

## Como exportar o extrato do seu banco

Quase todo banco e app (Nubank, Inter, Itaú, Bradesco, C6, etc.) tem, na tela do extrato ou da fatura, um botão de **exportar** ou **baixar extrato**. Escolha **OFX** quando existir (é o mais completo) ou **CSV/Excel**. Depois é só arrastar o arquivo para o dashboard.

## Estrutura do projeto

```
app/            páginas e layout (Next.js App Router)
  page.tsx      tela principal (upload + dashboard)
  api/data/     rota opcional de persistência na Vercel (Blob)
components/      componentes visuais (gráficos, cards, upload)
lib/            lógica: parsers, categorização, análise, storage
exemplos/        extratos de exemplo para teste
```

## Ajustar as categorias

O "cérebro" da categorização está em `lib/categorize.ts`. Cada categoria tem uma lista de palavras-chave. Se algum gasto seu está caindo em "Outros", é só adicionar a palavra-chave correspondente na categoria certa.
