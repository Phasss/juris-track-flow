/**
 * Registro de endpoints MNI (Modelo Nacional de Interoperabilidade) por tribunal.
 *
 * Cada tribunal publica o próprio serviço SOAP seguindo o padrão do CNJ
 * (`servico-intercomunicacao-2.2.2`), mas o host e o caminho variam. Exemplo
 * real e público do TJPE:
 *
 *   https://pjemni.app.tjpe.jus.br/2g/servico-intercomunicacao-2.2.2?wsdl
 *
 * Os endpoints abaixo seguem esse padrão, porém **cada tribunal deve ser
 * confirmado** no portal de dados abertos / acesso automatizado do respectivo
 * TJ ou TRT antes do uso em produção — por isso o endpoint também pode ser
 * sobrescrito em Configurações › Integração PJe.
 */

export type Grau = "1g" | "2g";

export type Tribunal = {
  sigla: string;
  nome: string;
  segmento: "estadual" | "trabalhista" | "federal";
  /** Host base do serviço MNI, sem o grau nem o nome do serviço. */
  hostMni?: string;
  /** Marcado quando o endpoint ainda precisa ser confirmado com o tribunal. */
  confirmar: boolean;
};

export const SERVICO_MNI = "servico-intercomunicacao-2.2.2";

export const TRIBUNAIS: Tribunal[] = [
  {
    sigla: "TJPE",
    nome: "Tribunal de Justiça de Pernambuco",
    segmento: "estadual",
    hostMni: "https://pjemni.app.tjpe.jus.br",
    confirmar: false,
  },
  {
    sigla: "TJSP",
    nome: "Tribunal de Justiça de São Paulo",
    segmento: "estadual",
    confirmar: true,
  },
  {
    sigla: "TJRJ",
    nome: "Tribunal de Justiça do Rio de Janeiro",
    segmento: "estadual",
    confirmar: true,
  },
  {
    sigla: "TJMG",
    nome: "Tribunal de Justiça de Minas Gerais",
    segmento: "estadual",
    confirmar: true,
  },
  { sigla: "TJBA", nome: "Tribunal de Justiça da Bahia", segmento: "estadual", confirmar: true },
  { sigla: "TJCE", nome: "Tribunal de Justiça do Ceará", segmento: "estadual", confirmar: true },
  { sigla: "TJPB", nome: "Tribunal de Justiça da Paraíba", segmento: "estadual", confirmar: true },
  {
    sigla: "TJRS",
    nome: "Tribunal de Justiça do Rio Grande do Sul",
    segmento: "estadual",
    confirmar: true,
  },
  { sigla: "TJPR", nome: "Tribunal de Justiça do Paraná", segmento: "estadual", confirmar: true },
  { sigla: "TRT6", nome: "TRT da 6ª Região (PE)", segmento: "trabalhista", confirmar: true },
  { sigla: "TRT1", nome: "TRT da 1ª Região (RJ)", segmento: "trabalhista", confirmar: true },
  { sigla: "TRT2", nome: "TRT da 2ª Região (SP)", segmento: "trabalhista", confirmar: true },
  { sigla: "TRT3", nome: "TRT da 3ª Região (MG)", segmento: "trabalhista", confirmar: true },
  { sigla: "TRF5", nome: "TRF da 5ª Região", segmento: "federal", confirmar: true },
  { sigla: "TRF1", nome: "TRF da 1ª Região", segmento: "federal", confirmar: true },
];

export function tribunalPorSigla(sigla: string): Tribunal | undefined {
  return TRIBUNAIS.find((t) => t.sigla.toUpperCase() === sigla.toUpperCase());
}

/** Monta a URL do serviço MNI a partir do host do tribunal e do grau. */
export function endpointMni(tribunal: Tribunal, grau: Grau = "1g"): string | null {
  if (!tribunal.hostMni) return null;
  return `${tribunal.hostMni.replace(/\/$/, "")}/${grau}/${SERVICO_MNI}`;
}
