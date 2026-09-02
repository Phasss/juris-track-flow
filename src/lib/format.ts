import type {
  CategoriaDocumento,
  FaseProcesso,
  ModalidadeAudiencia,
  PrazoStatus,
  PrioridadeTarefa,
  StatusAudiencia,
  StatusTarefa,
  TipoAudiencia,
} from "./mock-data";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatCurrency(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function diasAte(iso: string) {
  const alvo = new Date(iso);
  alvo.setHours(12, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

export function prazoStatus(iso: string): PrazoStatus {
  const dias = diasAte(iso);
  if (dias < 0) return "vencido";
  if (dias <= 7) return "atencao";
  return "no-prazo";
}

export const statusLabel: Record<PrazoStatus, string> = {
  "no-prazo": "No prazo",
  atencao: "Atenção",
  vencido: "Vencido",
};

export function prazoRelativo(iso: string) {
  const dias = diasAte(iso);
  if (dias === 0) return "vence hoje";
  if (dias === 1) return "vence amanhã";
  if (dias > 1) return `em ${dias} dias`;
  if (dias === -1) return "venceu ontem";
  return `venceu há ${Math.abs(dias)} dias`;
}

export const faseLabel: Record<FaseProcesso, string> = {
  conhecimento: "Conhecimento",
  instrucao: "Instrução",
  recursal: "Recursal",
  execucao: "Execução",
  arquivado: "Arquivado",
};

export const categoriaDocumentoLabel: Record<CategoriaDocumento, string> = {
  peticao: "Petição",
  decisao: "Decisão / ato judicial",
  contrato: "Contrato",
  procuracao: "Procuração",
  "documento-pessoal": "Documento pessoal",
  prova: "Prova",
  comprovante: "Comprovante",
  outro: "Outro",
};

export const prioridadeLabel: Record<PrioridadeTarefa, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const statusTarefaLabel: Record<StatusTarefa, string> = {
  pendente: "Pendente",
  "em-andamento": "Em andamento",
  concluida: "Concluída",
};

export const tipoAudienciaLabel: Record<TipoAudiencia, string> = {
  conciliacao: "Conciliação",
  instrucao: "Instrução",
  una: "Audiência una",
  julgamento: "Julgamento",
  justificacao: "Justificação",
  outra: "Outra",
};

export const modalidadeAudienciaLabel: Record<ModalidadeAudiencia, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  hibrida: "Híbrida",
};

export const statusAudienciaLabel: Record<StatusAudiencia, string> = {
  agendada: "Agendada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  adiada: "Adiada",
};

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase();
  return `${partes[0]![0] ?? ""}${partes[partes.length - 1]![0] ?? ""}`.toUpperCase();
}
