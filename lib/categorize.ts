import { Transaction } from "./types";

// Cada categoria tem palavras-chave e uma cor fixa (usada nos gráficos).
export const CATEGORIES: {
  name: string;
  color: string;
  keywords: string[];
}[] = [
  {
    name: "Alimentação",
    color: "#FF6B5C",
    keywords: [
      "ifood", "rappi", "restaurante", "lanchonete", "burguer", "burger", "pizza",
      "padaria", "cafe", "café", "bar ", "hamburgueria", "food", "mc donald",
      "mcdonald", "bk ", "subway", "outback", "china in box", "habib", "sushi",
      "acai", "açaí", "sorvete", "doceria", "confeitaria", "espeto", "churrasc",
    ],
  },
  {
    name: "Mercado",
    color: "#FFB020",
    keywords: [
      "mercado", "supermercado", "hipermercado", "carrefour", "pao de acucar",
      "pão de açúcar", "assai", "assaí", "atacadao", "atacadão", "extra ",
      "big ", "sam's", "sams club", "hortifruti", "sacolao", "sacolão", "açougue",
      "acougue", "emporio", "empório", "mercearia", "dia ", "tenda", "makro",
    ],
  },
  {
    name: "Transporte",
    color: "#5B9DFF",
    keywords: [
      "uber", "99app", "99 ", "99*", "cabify", "posto", "combustivel", "combustível",
      "gasolina", "etanol", "ipiranga", "shell", "petrobras", "br mania", "ale ",
      "estacionamento", "estapar", "pedagio", "pedágio", "sem parar", "veloe",
      "conectcar", "metro", "metrô", "cptm", "onibus", "ônibus", "bilhete unico",
      "passagem", "latam", "gol ", "azul ", "localiza", "movida", "unidas",
    ],
  },
  {
    name: "Saúde",
    color: "#3DDC97",
    keywords: [
      "farmacia", "farmácia", "drogaria", "drogasil", "droga raia", "pacheco",
      "pague menos", "ultrafarma", "hospital", "clinica", "clínica", "laboratorio",
      "laboratório", "fleury", "dasa", "unimed", "amil", "sulamerica", "hapvida",
      "dentista", "odonto", "psicolog", "medico", "médico", "consulta", "exame",
    ],
  },
  {
    name: "Moradia",
    color: "#A78BFA",
    keywords: [
      "aluguel", "condominio", "condomínio", "imobiliaria", "imobiliária",
      "energia", "eletropaulo", "enel", "cpfl", "light ", "cemig", "copel",
      "sabesp", "agua", "água", "saneamento", "gas ", "gás", "comgas", "iptu",
    ],
  },
  {
    name: "Contas & Internet",
    color: "#38E1D6",
    keywords: [
      "vivo", "claro", "tim ", "oi ", "nextel", "internet", "banda larga",
      "net ", "telefon", "celular", "recarga", "conta de luz", "fatura",
    ],
  },
  {
    name: "Assinaturas",
    color: "#F472B6",
    keywords: [
      "netflix", "spotify", "amazon prime", "prime video", "disney", "hbo", "max ",
      "globoplay", "deezer", "youtube premium", "apple.com", "apple com", "icloud",
      "google ", "playstation", "xbox", "steam", "canva", "chatgpt", "openai",
      "notion", "office 365", "microsoft", "paramount", "twitch", "crunchyroll",
    ],
  },
  {
    name: "Compras",
    color: "#B4E24C",
    keywords: [
      "mercado livre", "mercadolivre", "mercadopago", "amazon", "shopee", "aliexpress",
      "magazine", "magalu", "americanas", "casas bahia", "ponto frio", "renner",
      "riachuelo", "c&a", "c e a", "zara", "shein", "netshoes", "centauro", "decathlon",
      "leroy", "loja", "shopping", "livraria", "saraiva",
    ],
  },
  {
    name: "Lazer",
    color: "#5B9DFF",
    keywords: [
      "cinema", "cinemark", "kinoplex", "ingresso", "show", "teatro", "evento",
      "balada", "boate", "clube", "parque", "viagem", "hotel", "airbnb", "booking",
      "decolar", "hoteis", "hotéis", "academia", "smartfit", "smart fit", "gym",
    ],
  },
  {
    name: "Educação",
    color: "#FFB020",
    keywords: [
      "escola", "colegio", "colégio", "faculdade", "universidade", "curso",
      "udemy", "alura", "coursera", "mensalidade", "material escolar", "livro",
    ],
  },
  {
    name: "Tarifas & Juros",
    color: "#FF6B5C",
    keywords: [
      "tarifa", "juros", "iof", "anuidade", "manutencao de conta", "manutenção",
      "encargos", "multa", "mora", "cesta de servicos", "cesta de serviços", "taxa",
    ],
  },
  {
    name: "Transferências",
    color: "#8A96AC",
    keywords: [
      "pix", "ted", "doc ", "transferencia", "transferência", "transfer",
      "saque", "deposito", "depósito", "boleto",
    ],
  },
];

const DEFAULT_CATEGORY = "Outros";
const DEFAULT_COLOR = "#5A657C";
const INCOME_CATEGORY = "Receitas";
const INCOME_COLOR = "#3DDC97";

const INCOME_KEYWORDS = [
  "salario", "salário", "pagamento", "rendimento", "provento", "restituicao",
  "restituição", "reembolso", "cashback", "estorno", "credito recebido",
];

export function categoryColor(name: string): string {
  if (name === DEFAULT_CATEGORY) return DEFAULT_COLOR;
  if (name === INCOME_CATEGORY) return INCOME_COLOR;
  const found = CATEGORIES.find((c) => c.name === name);
  return found ? found.color : DEFAULT_COLOR;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function categorizeOne(tx: Transaction): string {
  const descNorm = normalize(tx.description);

  if (tx.amount > 0) {
    for (const kw of INCOME_KEYWORDS) {
      if (descNorm.includes(normalize(kw))) return INCOME_CATEGORY;
    }
    // entrada sem palavra-chave clara continua como Receitas
    return INCOME_CATEGORY;
  }

  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      if (descNorm.includes(normalize(kw))) return cat.name;
    }
  }
  return DEFAULT_CATEGORY;
}

export function categorizeAll(txs: Transaction[]): Transaction[] {
  return txs.map((tx) => ({
    ...tx,
    category: tx.category || categorizeOne(tx),
  }));
}
