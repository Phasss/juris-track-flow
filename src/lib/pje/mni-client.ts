/**
 * Cliente SOAP do MNI 2.2.2 (Modelo Nacional de Interoperabilidade do CNJ).
 *
 * IMPORTANTE — este módulo só roda no servidor. O PJe não expõe CORS e a
 * autenticação pode exigir certificado ICP-Brasil, então a chamada nunca pode
 * partir do navegador. O acesso acontece pelas server functions em
 * `src/lib/pje/consulta.ts`.
 *
 * Os namespaces abaixo seguem o padrão publicado pelo CNJ para a versão 2.2.2
 * (`servico-intercomunicacao-2.2.2`). Não foi possível validá-los contra o WSDL
 * oficial durante a implementação (o arquivo no portal do CNJ responde 403),
 * portanto eles ficam expostos como constantes: se o tribunal usar variação,
 * basta ajustar aqui ou sobrescrever por variável de ambiente.
 */

import type {
  CredenciaisMni,
  MovimentoPje,
  PartePje,
  ProcessoPje,
  ResultadoConsulta,
} from "./types";

export const NS_SERVICO =
  process.env["PJE_MNI_NS_SERVICO"] ?? "http://www.cnj.jus.br/servico-intercomunicacao-2.2.2/";
export const NS_TIPOS =
  process.env["PJE_MNI_NS_TIPOS"] ?? "http://www.cnj.jus.br/tipos-servico-intercomunicacao-2.2.2";

function escaparXml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function montarEnvelopeConsulta(
  credenciais: Pick<CredenciaisMni, "idConsultante" | "senhaConsultante">,
  numeroProcesso: string,
  opcoes: { movimentos?: boolean; cabecalho?: boolean; documentos?: boolean } = {},
): string {
  const { movimentos = true, cabecalho = true, documentos = false } = opcoes;

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="${NS_SERVICO}" xmlns:tip="${NS_TIPOS}">
  <soapenv:Header/>
  <soapenv:Body>
    <ser:consultarProcesso>
      <tip:idConsultante>${escaparXml(credenciais.idConsultante)}</tip:idConsultante>
      <tip:senhaConsultante>${escaparXml(credenciais.senhaConsultante)}</tip:senhaConsultante>
      <tip:numeroProcesso>${escaparXml(numeroProcesso.replace(/\D/g, ""))}</tip:numeroProcesso>
      <tip:movimentos>${movimentos}</tip:movimentos>
      <tip:incluirCabecalho>${cabecalho}</tip:incluirCabecalho>
      <tip:incluirDocumentos>${documentos}</tip:incluirDocumentos>
    </ser:consultarProcesso>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function decodificarEntidades(texto: string): string {
  return texto
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&");
}

/** Conteúdo textual da primeira ocorrência de uma tag (ignorando namespace). */
export function extrairTexto(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<(?:[\\w.-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}>`, "i");
  const m = re.exec(xml);
  if (!m) return undefined;
  const bruto = decodificarEntidades(m[1] ?? "").trim();
  return bruto.length > 0 ? bruto : undefined;
}

/** Valor de um atributo da primeira tag encontrada. */
export function extrairAtributo(xml: string, tag: string, atributo: string): string | undefined {
  const re = new RegExp(`<(?:[\\w.-]+:)?${tag}\\b([^>]*)>`, "i");
  const m = re.exec(xml);
  if (!m) return undefined;
  const attrRe = new RegExp(`${atributo}\\s*=\\s*"([^"]*)"`, "i");
  const a = attrRe.exec(m[1] ?? "");
  return a ? decodificarEntidades(a[1] ?? "") : undefined;
}

/** Todos os blocos (incluindo as tags) de uma determinada tag. */
export function extrairBlocos(xml: string, tag: string): string[] {
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>[\\s\\S]*?</(?:[\\w.-]+:)?${tag}>|<(?:[\\w.-]+:)?${tag}\\b[^>]*/>`,
    "gi",
  );
  return xml.match(re) ?? [];
}

/**
 * Datas do MNI vêm no formato `yyyyMMddHHmmss` (ou `yyyyMMdd`).
 * Converte para ISO; devolve a string original se o formato não bater.
 */
export function dataMniParaIso(valor: string | undefined): string | undefined {
  if (!valor) return undefined;
  const d = valor.replace(/\D/g, "");
  if (d.length < 8) return undefined;
  const ano = Number(d.slice(0, 4));
  const mes = Number(d.slice(4, 6)) - 1;
  const dia = Number(d.slice(6, 8));
  const hora = d.length >= 10 ? Number(d.slice(8, 10)) : 12;
  const min = d.length >= 12 ? Number(d.slice(10, 12)) : 0;
  const seg = d.length >= 14 ? Number(d.slice(12, 14)) : 0;
  const dt = new Date(ano, mes, dia, hora, min, seg);
  return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
}

function mapearPolo(valor: string | undefined): PartePje["polo"] {
  const v = (valor ?? "").toUpperCase();
  if (v.startsWith("AT")) return "ativo";
  if (v.startsWith("PA")) return "passivo";
  return "outro";
}

export function parsearRespostaConsulta(xml: string, tribunal: string): ProcessoPje | null {
  const sucesso = extrairTexto(xml, "sucesso");
  if (sucesso && sucesso.toLowerCase() === "false") return null;

  const dadosBasicos = extrairBlocos(xml, "dadosBasicos")[0] ?? xml;

  const numero =
    extrairAtributo(dadosBasicos, "dadosBasicos", "numero") ??
    extrairTexto(xml, "numeroProcesso") ??
    "";

  const classe =
    extrairAtributo(dadosBasicos, "dadosBasicos", "classeProcessual") ??
    extrairTexto(dadosBasicos, "classeProcessual") ??
    "Classe não informada";

  const orgao =
    extrairTexto(dadosBasicos, "nomeOrgao") ??
    extrairAtributo(dadosBasicos, "orgaoJulgador", "nomeOrgao") ??
    "Órgão não informado";

  const valorCausaBruto =
    extrairAtributo(dadosBasicos, "dadosBasicos", "valorCausa") ??
    extrairTexto(dadosBasicos, "valorCausa");

  const partes: PartePje[] = extrairBlocos(xml, "polo").flatMap((bloco) => {
    const polo = mapearPolo(extrairAtributo(bloco, "polo", "polo"));
    return extrairBlocos(bloco, "parte").map((p) => ({
      nome: extrairTexto(p, "nome") ?? "Parte não identificada",
      polo,
      documento: extrairTexto(p, "numeroDocumentoPrincipal"),
      advogado: extrairTexto(p, "advogado"),
    }));
  });

  const movimentos: MovimentoPje[] = extrairBlocos(xml, "movimento")
    .map((bloco) => {
      const data =
        dataMniParaIso(extrairAtributo(bloco, "movimento", "dataHora")) ??
        dataMniParaIso(extrairTexto(bloco, "dataHora"));
      const codigo =
        extrairTexto(bloco, "codigoNacional") ??
        extrairAtributo(bloco, "movimentoNacional", "codigoNacional");
      const complemento = extrairTexto(bloco, "complemento");
      const descricao =
        extrairTexto(bloco, "descricao") ?? complemento ?? "Movimento sem descrição";
      return {
        identificador: extrairAtributo(bloco, "movimento", "identificadorMovimento"),
        data: data ?? new Date().toISOString(),
        titulo: extrairTexto(bloco, "descricao") ?? `Movimento ${codigo ?? ""}`.trim(),
        descricao,
        codigoNacional: codigo ? Number(codigo) : undefined,
      };
    })
    .sort((a, b) => +new Date(b.data) - +new Date(a.data));

  if (!numero && movimentos.length === 0 && partes.length === 0) return null;

  return {
    numero,
    classe,
    assunto: extrairTexto(dadosBasicos, "assunto") ?? undefined,
    orgaoJulgador: orgao,
    comarca: extrairTexto(dadosBasicos, "municipio") ?? "Não informada",
    tribunal,
    valorCausa: valorCausaBruto ? Number(valorCausaBruto.replace(",", ".")) : undefined,
    dataAjuizamento: dataMniParaIso(
      extrairAtributo(dadosBasicos, "dadosBasicos", "dataAjuizamento"),
    ),
    segredoJustica: (extrairAtributo(dadosBasicos, "dadosBasicos", "nivelSigilo") ?? "0") !== "0",
    partes,
    movimentos,
  };
}

/** Mensagem de erro devolvida no SOAP Fault ou no campo `mensagem` do MNI. */
export function extrairErro(xml: string): string | undefined {
  return (
    extrairTexto(xml, "faultstring") ??
    extrairTexto(xml, "Text") ??
    extrairTexto(xml, "mensagem") ??
    undefined
  );
}

export async function consultarProcessoMni(
  credenciais: CredenciaisMni,
  numeroProcesso: string,
  tribunal: string,
  opcoes: { timeoutMs?: number } = {},
): Promise<ResultadoConsulta> {
  const { timeoutMs = 20_000 } = opcoes;
  const envelope = montarEnvelopeConsulta(credenciais, numeroProcesso);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resposta = await fetch(credenciais.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `${NS_SERVICO}consultarProcesso`,
      },
      body: envelope,
      signal: controller.signal,
    });

    const xml = await resposta.text();

    if (!resposta.ok) {
      return {
        sucesso: false,
        fonte: "mni",
        codigo: String(resposta.status),
        erro:
          extrairErro(xml) ??
          `O tribunal respondeu ${resposta.status} ${resposta.statusText}. Verifique o endpoint e as credenciais.`,
      };
    }

    const erro = extrairErro(xml);
    const processo = parsearRespostaConsulta(xml, tribunal);

    if (!processo) {
      return {
        sucesso: false,
        fonte: "mni",
        erro:
          erro ??
          "O tribunal não retornou dados do processo. Confira o número e se o consultante tem acesso aos autos.",
      };
    }

    return {
      sucesso: true,
      fonte: "mni",
      processo,
      consultadoEm: new Date().toISOString(),
    };
  } catch (error) {
    const abortado = error instanceof Error && error.name === "AbortError";
    return {
      sucesso: false,
      fonte: "mni",
      erro: abortado
        ? `O tribunal não respondeu em ${Math.round(timeoutMs / 1000)}s.`
        : `Falha ao contatar o serviço MNI: ${error instanceof Error ? error.message : String(error)}`,
    };
  } finally {
    clearTimeout(timer);
  }
}
