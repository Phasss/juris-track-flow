import type { PrazoStatus } from "./mock-data";

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
