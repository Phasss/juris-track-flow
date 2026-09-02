/**
 * Server functions da integração com o PJe.
 *
 * Tudo aqui executa **somente no servidor**: as credenciais do MNI nunca são
 * enviadas ao navegador e a chamada SOAP sai do backend, contornando a ausência
 * de CORS no PJe.
 *
 * Seleção de adaptador:
 *   - Com `PJE_MNI_ENDPOINT`, `PJE_MNI_ID_CONSULTANTE` e `PJE_MNI_SENHA_CONSULTANTE`
 *     definidos, usa o cliente MNI real.
 *   - Sem credenciais, cai no simulador — a interface deixa isso explícito.
 */

import { createServerFn } from "@tanstack/react-start";

import { consultarProcessoMni } from "@/lib/pje/mni-client";
import { validarNumeroCnj } from "@/lib/pje/numero-cnj";
import { consultarProcessoSimulado } from "@/lib/pje/simulador";
import { endpointMni, tribunalPorSigla } from "@/lib/pje/tribunais";
import type { CredenciaisMni, ResultadoConsulta, StatusIntegracao } from "@/lib/pje/types";

function lerCredenciais(): CredenciaisMni | null {
  const endpoint = process.env["PJE_MNI_ENDPOINT"]?.trim();
  const idConsultante = process.env["PJE_MNI_ID_CONSULTANTE"]?.trim();
  const senhaConsultante = process.env["PJE_MNI_SENHA_CONSULTANTE"]?.trim();

  if (!endpoint || !idConsultante || !senhaConsultante) return null;
  return { endpoint, idConsultante, senhaConsultante };
}

export const statusIntegracaoPje = createServerFn({ method: "GET" }).handler(
  async (): Promise<StatusIntegracao> => {
    const credenciais = lerCredenciais();

    if (!credenciais) {
      return {
        configurado: false,
        fonte: "simulador",
        mensagem:
          "Modo demonstração: os dados vêm de um simulador determinístico. Configure as credenciais do MNI no servidor para consultar o PJe de verdade.",
      };
    }

    return {
      configurado: true,
      fonte: "mni",
      endpoint: credenciais.endpoint,
      mensagem: "Integração MNI ativa — consultas são feitas diretamente no tribunal.",
    };
  },
);

type EntradaConsulta = { numero: string; tribunal?: string | undefined };

export const consultarProcessoPje = createServerFn({ method: "POST" })
  .validator((entrada: unknown): EntradaConsulta => {
    if (typeof entrada !== "object" || entrada === null) {
      throw new Error("Parâmetros inválidos para a consulta.");
    }
    const { numero, tribunal } = entrada as Record<string, unknown>;
    if (typeof numero !== "string" || numero.trim().length === 0) {
      throw new Error("Informe o número do processo.");
    }
    return {
      numero: numero.trim(),
      tribunal: typeof tribunal === "string" && tribunal.trim() ? tribunal.trim() : undefined,
    };
  })
  .handler(async ({ data }): Promise<ResultadoConsulta> => {
    const validacao = validarNumeroCnj(data.numero);
    if (!validacao.valido) {
      return { sucesso: false, fonte: "simulador", erro: validacao.erro };
    }

    const credenciais = lerCredenciais();
    if (!credenciais) {
      return consultarProcessoSimulado(data.numero);
    }

    // O endpoint por variável de ambiente vale para todos os tribunais; quando o
    // tribunal tem host próprio no registro, ele tem precedência.
    const sigla = data.tribunal ?? validacao.numero.sigla;
    const tribunal = tribunalPorSigla(sigla);
    const endpointDoTribunal = tribunal ? endpointMni(tribunal) : null;

    return consultarProcessoMni(
      { ...credenciais, endpoint: endpointDoTribunal ?? credenciais.endpoint },
      validacao.numero.formatado,
      sigla,
    );
  });
