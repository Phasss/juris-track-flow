/**
 * Tipos do domínio da integração com o PJe.
 *
 * O contrato aqui é o que a aplicação consome — propositalmente independente do
 * transporte. Hoje existem dois adaptadores que o implementam: o simulador
 * (padrão, sem credenciais) e o cliente MNI/SOAP real.
 */

export type MovimentoPje = {
  /** Identificador do movimento no tribunal, quando informado. */
  identificador?: string | undefined;
  data: string; // ISO
  titulo: string;
  descricao: string;
  /** Código do movimento na Tabela Processual Unificada do CNJ. */
  codigoNacional?: number | undefined;
};

export type PartePje = {
  nome: string;
  polo: "ativo" | "passivo" | "outro";
  documento?: string | undefined;
  advogado?: string | undefined;
};

export type ProcessoPje = {
  numero: string;
  classe: string;
  assunto?: string | undefined;
  orgaoJulgador: string;
  comarca: string;
  tribunal: string;
  valorCausa?: number | undefined;
  dataAjuizamento?: string | undefined; // ISO
  segredoJustica: boolean;
  partes: PartePje[];
  movimentos: MovimentoPje[];
};

export type ResultadoConsulta =
  | { sucesso: true; processo: ProcessoPje; fonte: FontePje; consultadoEm: string }
  | { sucesso: false; erro: string; codigo?: string | undefined; fonte: FontePje };

/** Qual adaptador atendeu a chamada — exibido na interface para não enganar o usuário. */
export type FontePje = "simulador" | "mni";

export type CredenciaisMni = {
  endpoint: string;
  idConsultante: string;
  senhaConsultante: string;
};

export type StatusIntegracao = {
  /** true quando há credenciais MNI configuradas no servidor. */
  configurado: boolean;
  fonte: FontePje;
  endpoint?: string | undefined;
  mensagem: string;
};

/** Contrato que todo adaptador do PJe precisa cumprir. */
export interface AdaptadorPje {
  readonly fonte: FontePje;
  consultarProcesso(numero: string): Promise<ResultadoConsulta>;
}
