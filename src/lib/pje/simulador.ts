/**
 * Adaptador de simulação do PJe.
 *
 * Usado enquanto não há credenciais MNI configuradas. Gera dados coerentes e
 * **determinísticos** a partir do próprio número do processo — consultar duas
 * vezes o mesmo número devolve o mesmo resultado, o que permite demonstrar a
 * sincronização sem enganar o usuário com dados aleatórios.
 */

import { validarNumeroCnj } from "./numero-cnj";
import type { MovimentoPje, ProcessoPje, ResultadoConsulta } from "./types";

/** Hash determinístico (FNV-1a) para derivar dados estáveis do número. */
function hash(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function escolher<T>(lista: readonly T[], semente: number): T {
  return lista[semente % lista.length]!;
}

const CLASSES = [
  "Procedimento Comum Cível",
  "Ação de Indenização por Danos Morais",
  "Execução de Título Extrajudicial",
  "Ação de Obrigação de Fazer",
  "Busca e Apreensão em Alienação Fiduciária",
  "Ação Monitória",
  "Inventário e Partilha",
] as const;

const ASSUNTOS = [
  "Indenização por Dano Moral",
  "Rescisão do Contrato e Devolução do Dinheiro",
  "Obrigações / Espécies de Contratos",
  "Verbas Rescisórias",
  "Cláusulas Abusivas",
  "Inclusão Indevida em Cadastro de Inadimplentes",
] as const;

/** Varas coerentes com o segmento do Judiciário indicado no número CNJ. */
const ORGAOS_POR_SEGMENTO: Record<string, readonly string[]> = {
  // Justiça dos Estados
  "8": [
    "1ª Vara Cível",
    "2ª Vara Cível",
    "3ª Vara Cível",
    "5ª Vara Cível",
    "9ª Vara Cível",
    "2ª Vara de Família e Sucessões",
    "1ª Vara Empresarial",
  ],
  // Justiça do Trabalho
  "5": [
    "1ª Vara do Trabalho",
    "3ª Vara do Trabalho",
    "7ª Vara do Trabalho",
    "12ª Vara do Trabalho",
  ],
  // Justiça Federal
  "4": ["1ª Vara Federal", "4ª Vara Federal", "9ª Vara Federal", "2ª Vara Federal Cível"],
};

const ORGAOS_PADRAO = ["1ª Vara", "2ª Vara", "3ª Vara"] as const;

/**
 * Comarcas por UF, para que o município simulado seja compatível com o
 * tribunal codificado no número do processo.
 */
const COMARCAS_POR_UF: Record<string, readonly string[]> = {
  PE: ["Recife/PE", "Olinda/PE", "Jaboatão dos Guararapes/PE", "Caruaru/PE", "Petrolina/PE"],
  SP: ["São Paulo/SP", "Campinas/SP", "Santos/SP", "Ribeirão Preto/SP"],
  RJ: ["Rio de Janeiro/RJ", "Niterói/RJ", "Duque de Caxias/RJ"],
  MG: ["Belo Horizonte/MG", "Uberlândia/MG", "Contagem/MG"],
  BA: ["Salvador/BA", "Feira de Santana/BA"],
  CE: ["Fortaleza/CE", "Caucaia/CE"],
  PB: ["João Pessoa/PB", "Campina Grande/PB"],
  RS: ["Porto Alegre/RS", "Caxias do Sul/RS"],
  PR: ["Curitiba/PR", "Londrina/PR"],
};

const COMARCAS_PADRAO = ["Capital", "Interior"] as const;

/** Extrai a UF a partir da sigla derivada do número (TJPE -> PE, TRT6 -> null). */
function ufDaSigla(sigla: string): string | null {
  const m = /^(?:TJ|TRE|TJM)([A-Z]{2})$/.exec(sigla);
  return m ? (m[1] ?? null) : null;
}

const EMPRESAS = [
  "Telecom Nordeste S/A",
  "Banco Meridiano S/A",
  "Distribuidora Alfa Ltda.",
  "Comercial Ipojuca ME",
  "Seguradora Continental S/A",
  "Varejo Atlântico Ltda.",
] as const;

const PESSOAS = [
  "Carlos Eduardo Ramos",
  "Fernanda Duarte Melo",
  "Roberto Nunes Cavalcanti",
  "Juliana Prado Barbosa",
  "Marcos Vinícius Teixeira",
] as const;

/** Movimentos típicos, do mais antigo ao mais recente. */
const TRILHA_MOVIMENTOS: Array<{ titulo: string; descricao: string; codigo: number }> = [
  {
    titulo: "Distribuição",
    descricao: "Processo distribuído por sorteio à unidade judiciária competente.",
    codigo: 26,
  },
  {
    titulo: "Conclusão para despacho",
    descricao: "Autos conclusos ao magistrado para análise da petição inicial.",
    codigo: 51,
  },
  {
    titulo: "Despacho",
    descricao: "Recebida a inicial. Cite-se a parte ré para responder no prazo legal.",
    codigo: 11010,
  },
  {
    titulo: "Expedição de mandado",
    descricao: "Expedido mandado de citação para cumprimento pelo oficial de justiça.",
    codigo: 60,
  },
  {
    titulo: "Citação cumprida",
    descricao: "Juntada de certidão do oficial de justiça informando a citação pessoal.",
    codigo: 12265,
  },
  {
    titulo: "Juntada de petição",
    descricao: "Juntada de contestação apresentada pela parte ré, com documentos.",
    codigo: 85,
  },
  {
    titulo: "Intimação",
    descricao: "Intimada a parte autora para apresentar réplica no prazo de 15 dias.",
    codigo: 12265,
  },
];

function iso(diasAtras: number, semente: number): string {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(9 + (semente % 8), (semente * 7) % 60, 0, 0);
  return d.toISOString();
}

export function gerarProcessoSimulado(numero: string): ProcessoPje | null {
  const validacao = validarNumeroCnj(numero);
  if (!validacao.valido) return null;

  const { numero: cnj } = validacao;
  const semente = hash(cnj.formatado);

  const qtdMovimentos = 4 + (semente % 4); // entre 4 e 7 movimentos
  const movimentos: MovimentoPje[] = TRILHA_MOVIMENTOS.slice(0, qtdMovimentos)
    .map((m, i) => ({
      identificador: `${semente}-${i}`,
      data: iso((qtdMovimentos - i) * 9 + (semente % 5), semente + i),
      titulo: m.titulo,
      descricao: m.descricao,
      codigoNacional: m.codigo,
    }))
    .sort((a, b) => +new Date(b.data) - +new Date(a.data));

  const trabalhista = cnj.segmento === "5";

  // Órgão e comarca precisam ser compatíveis com o segmento e a UF do próprio
  // número — um processo do TJPE não pode cair numa Vara do Trabalho carioca.
  const orgaos = ORGAOS_POR_SEGMENTO[cnj.segmento] ?? ORGAOS_PADRAO;
  const uf = ufDaSigla(cnj.sigla);
  const comarcas = (uf && COMARCAS_POR_UF[uf]) || COMARCAS_PADRAO;

  return {
    numero: cnj.formatado,
    classe: trabalhista ? "Reclamação Trabalhista" : escolher(CLASSES, semente),
    assunto: escolher(ASSUNTOS, semente >> 3),
    orgaoJulgador: escolher(orgaos, semente >> 5),
    comarca: escolher(comarcas, semente >> 7),
    tribunal: cnj.sigla,
    valorCausa: 8_000 + (semente % 190_000),
    dataAjuizamento: iso(qtdMovimentos * 9 + 40, semente),
    segredoJustica: semente % 11 === 0,
    partes: [
      {
        nome: escolher(PESSOAS, semente >> 2),
        polo: "ativo",
        documento: String(10_000_000_000 + (semente % 89_999_999_999)),
      },
      { nome: escolher(EMPRESAS, semente >> 4), polo: "passivo" },
    ],
    movimentos,
  };
}

export async function consultarProcessoSimulado(numero: string): Promise<ResultadoConsulta> {
  // Latência artificial curta, só para o estado de carregamento aparecer.
  await new Promise((r) => setTimeout(r, 450));

  const validacao = validarNumeroCnj(numero);
  if (!validacao.valido) {
    return { sucesso: false, fonte: "simulador", erro: validacao.erro };
  }

  const processo = gerarProcessoSimulado(numero);
  if (!processo) {
    return { sucesso: false, fonte: "simulador", erro: "Não foi possível simular este processo." };
  }

  return {
    sucesso: true,
    fonte: "simulador",
    processo,
    consultadoEm: new Date().toISOString(),
  };
}
