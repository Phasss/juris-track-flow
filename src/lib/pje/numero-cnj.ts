/**
 * Numeração única de processos judiciais — Resolução CNJ nº 65/2008.
 *
 * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
 *   N (7) sequencial por unidade de origem e ano
 *   D (2) dígito verificador
 *   A (4) ano do ajuizamento
 *   J (1) segmento do Poder Judiciário
 *   T (2) tribunal do segmento
 *   O (4) unidade de origem
 *
 * O dígito verificador é definido pela norma como
 *   DD = 98 - ((NNNNNNN AAAA J TR OOOO seguido de "00") mod 97)
 * (módulo 97 base 10, o mesmo esquema da ISO 7064 usado no IBAN).
 */

export const SEGMENTOS: Record<string, string> = {
  "1": "Supremo Tribunal Federal",
  "2": "Conselho Nacional de Justiça",
  "3": "Superior Tribunal de Justiça",
  "4": "Justiça Federal",
  "5": "Justiça do Trabalho",
  "6": "Justiça Eleitoral",
  "7": "Justiça Militar da União",
  "8": "Justiça dos Estados e do Distrito Federal",
  "9": "Justiça Militar Estadual",
};

const UFS_ESTADUAL: Record<string, string> = {
  "01": "AC",
  "02": "AL",
  "03": "AP",
  "04": "AM",
  "05": "BA",
  "06": "CE",
  "07": "DF",
  "08": "ES",
  "09": "GO",
  "10": "MA",
  "11": "MT",
  "12": "MS",
  "13": "MG",
  "14": "PA",
  "15": "PB",
  "16": "PR",
  "17": "PE",
  "18": "PI",
  "19": "RJ",
  "20": "RN",
  "21": "RS",
  "22": "RO",
  "23": "RR",
  "24": "SC",
  "25": "SE",
  "26": "SP",
  "27": "TO",
};

export type NumeroCnj = {
  sequencial: string;
  digito: string;
  ano: string;
  segmento: string;
  tribunal: string;
  origem: string;
  /** Sigla derivada: TJPE, TRT6, TRF5... */
  sigla: string;
  formatado: string;
};

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Aplica a máscara NNNNNNN-DD.AAAA.J.TR.OOOO conforme o usuário digita. */
export function mascararNumeroCnj(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 20);
  let saida = d.slice(0, 7);
  if (d.length > 7) saida += `-${d.slice(7, 9)}`;
  if (d.length > 9) saida += `.${d.slice(9, 13)}`;
  if (d.length > 13) saida += `.${d.slice(13, 14)}`;
  if (d.length > 14) saida += `.${d.slice(14, 16)}`;
  if (d.length > 16) saida += `.${d.slice(16, 20)}`;
  return saida;
}

function siglaDoTribunal(segmento: string, tribunal: string): string {
  if (segmento === "8") {
    const uf = UFS_ESTADUAL[tribunal];
    return uf ? `TJ${uf}` : `TJ (${tribunal})`;
  }
  if (segmento === "5") return `TRT${Number(tribunal)}`;
  if (segmento === "4") return `TRF${Number(tribunal)}`;
  if (segmento === "6") {
    const uf = UFS_ESTADUAL[tribunal];
    return uf ? `TRE${uf}` : `TRE (${tribunal})`;
  }
  if (segmento === "9") {
    const uf = UFS_ESTADUAL[tribunal];
    return uf ? `TJM${uf}` : `TJM (${tribunal})`;
  }
  if (segmento === "1") return "STF";
  if (segmento === "2") return "CNJ";
  if (segmento === "3") return "STJ";
  if (segmento === "7") return "STM";
  return `Tribunal ${tribunal}`;
}

/** Calcula o dígito verificador (2 caracteres) para um número sem DD. */
export function calcularDigito(
  sequencial: string,
  ano: string,
  segmento: string,
  tribunal: string,
  origem: string,
): string {
  const base = `${sequencial}${ano}${segmento}${tribunal}${origem}00`;
  const resto = Number(BigInt(base) % 97n);
  return String(98 - resto).padStart(2, "0");
}

export type ResultadoValidacao =
  { valido: true; numero: NumeroCnj } | { valido: false; erro: string };

export function validarNumeroCnj(valor: string): ResultadoValidacao {
  const d = apenasDigitos(valor);

  if (d.length === 0) return { valido: false, erro: "Informe o número do processo." };
  if (d.length !== 20) {
    return {
      valido: false,
      erro: `O número deve ter 20 dígitos (informados: ${d.length}).`,
    };
  }

  const sequencial = d.slice(0, 7);
  const digito = d.slice(7, 9);
  const ano = d.slice(9, 13);
  const segmento = d.slice(13, 14);
  const tribunal = d.slice(14, 16);
  const origem = d.slice(16, 20);

  if (!SEGMENTOS[segmento]) {
    return { valido: false, erro: `Segmento do Judiciário inválido: "${segmento}".` };
  }

  const anoNum = Number(ano);
  const anoAtual = new Date().getFullYear();
  if (anoNum < 1900 || anoNum > anoAtual + 1) {
    return { valido: false, erro: `Ano de ajuizamento improvável: ${ano}.` };
  }

  const esperado = calcularDigito(sequencial, ano, segmento, tribunal, origem);
  if (esperado !== digito) {
    return {
      valido: false,
      erro: `Dígito verificador inválido — informado ${digito}, esperado ${esperado}.`,
    };
  }

  return {
    valido: true,
    numero: {
      sequencial,
      digito,
      ano,
      segmento,
      tribunal,
      origem,
      sigla: siglaDoTribunal(segmento, tribunal),
      formatado: `${sequencial}-${digito}.${ano}.${segmento}.${tribunal}.${origem}`,
    },
  };
}

/** Descrição legível do segmento, para exibir no formulário de cadastro. */
export function descreverNumero(numero: NumeroCnj): string {
  return `${SEGMENTOS[numero.segmento]} — ${numero.sigla}, unidade ${numero.origem}, ajuizado em ${numero.ano}`;
}
