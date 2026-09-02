import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  FileClock,
  FileText,
  Gavel,
  MessageCircle,
  SquareCheckBig,
  Timer,
} from "lucide-react";
import { useApp } from "@/lib/app-store";
import { Card, SectionTitle, StatCard, StatusBadge, Tag } from "@/components/app/ui";
import {
  formatDate,
  formatDateTime,
  formatTime,
  prazoStatus,
  tipoAudienciaLabel,
} from "@/lib/format";
import { diasUteisAte, prazoUtilRelativo } from "@/lib/prazo";
import type { Atividade } from "@/lib/mock-data";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

const iconePorTipo: Record<Atividade["tipo"], typeof Gavel> = {
  andamento: Gavel,
  prazo: Timer,
  mensagem: MessageCircle,
  documento: FileText,
  tarefa: SquareCheckBig,
  audiencia: CalendarDays,
};

function DashboardPage() {
  const { processos, clientePorId, atividades, perfil, tarefas, audiencias } = useApp();

  const prazosSemana = processos.filter((p) => {
    const dias = diasUteisAte(p.prazoData);
    return dias >= 0 && dias <= 5;
  });
  const semAtualizacao = processos.filter((p) => diasUteisAte(p.ultimaMovimentacao) < -30);
  const vencidos = processos.filter((p) => diasUteisAte(p.prazoData) < 0);

  const tarefasAbertas = tarefas.filter((t) => t.status !== "concluida");
  const tarefasAtrasadas = tarefasAbertas.filter((t) => t.prazo && diasUteisAte(t.prazo) < 0);

  const proximasAudiencias = audiencias
    .filter((a) => a.status === "agendada" && diasUteisAte(a.data) >= 0)
    .sort((a, b) => +new Date(a.data) - +new Date(b.data))
    .slice(0, 3);

  const proximos = [...processos].sort((a, b) => +new Date(a.prazoData) - +new Date(b.prazoData));

  const primeiroNome = perfil.responsavel.split(" ").slice(0, 2).join(" ");

  return (
    <div className="space-y-8">
      <SectionTitle
        title={`Bom trabalho, ${primeiroNome}`}
        description="Visão geral da sua carteira, dos prazos mais próximos e do que precisa de você hoje."
      />

      {(vencidos.length > 0 || tarefasAtrasadas.length > 0) && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" strokeWidth={1.5} />
          <div className="min-w-0 text-sm text-foreground">
            {vencidos.length > 0 && (
              <p>
                <strong className="font-medium">
                  {vencidos.length} prazo{vencidos.length > 1 ? "s" : ""} vencido
                  {vencidos.length > 1 ? "s" : ""}
                </strong>{" "}
                precisa da sua atenção imediata.
              </p>
            )}
            {tarefasAtrasadas.length > 0 && (
              <p className={vencidos.length > 0 ? "mt-1" : undefined}>
                <Link to="/app/tarefas" className="font-medium underline underline-offset-4">
                  {tarefasAtrasadas.length} tarefa{tarefasAtrasadas.length > 1 ? "s" : ""} atrasada
                  {tarefasAtrasadas.length > 1 ? "s" : ""}
                </Link>{" "}
                no seu quadro.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Processos ativos"
          valor={processos.length}
          detalhe="carteira em andamento"
          icon={<Gavel className="size-4.5" strokeWidth={1.5} />}
        />
        <StatCard
          label="Prazos em 5 dias úteis"
          valor={prazosSemana.length}
          detalhe="contagem em dias úteis"
          icon={<CalendarClock className="size-4.5" strokeWidth={1.5} />}
          tone={prazosSemana.length > 0 ? "destaque" : "neutro"}
        />
        <StatCard
          label="Tarefas em aberto"
          valor={tarefasAbertas.length}
          detalhe={`${tarefasAtrasadas.length} atrasadas`}
          icon={<SquareCheckBig className="size-4.5" strokeWidth={1.5} />}
          tone={tarefasAtrasadas.length > 0 ? "perigo" : "neutro"}
        />
        <StatCard
          label="Sem atualização"
          valor={semAtualizacao.length}
          detalhe="há mais de 30 dias úteis"
          icon={<FileClock className="size-4.5" strokeWidth={1.5} />}
        />
      </div>

      {proximasAudiencias.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
            <h2 className="font-serif text-xl text-card-foreground">Próximas audiências</h2>
            <Link
              to="/app/agenda"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Ver agenda
            </Link>
          </div>
          <div className="divide-y divide-border">
            {proximasAudiencias.map((a) => {
              const processo = processos.find((p) => p.id === a.processoId);
              return (
                <Link
                  key={a.id}
                  to="/app/processos/$id"
                  params={{ id: a.processoId }}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/60"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <CalendarDays className="size-4.5" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {tipoAudienciaLabel[a.tipo]} —{" "}
                      {processo ? (clientePorId(processo.clienteId)?.nome ?? "") : ""}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{a.local}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm text-foreground">
                      {formatDate(a.data)} · {formatTime(a.data)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {prazoUtilRelativo(a.data)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
            <h2 className="font-serif text-xl text-card-foreground">Próximos prazos</h2>
            <Link
              to="/app/processos"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Processo</th>
                  <th className="px-6 py-3 font-medium">Tipo de prazo</th>
                  <th className="px-6 py-3 font-medium">Data limite</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {proximos.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/70 last:border-0 hover:bg-secondary/60"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to="/app/processos/$id"
                        params={{ id: p.id }}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {clientePorId(p.clienteId)?.nome}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {p.numero}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.prazoTipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-foreground">{formatDate(p.prazoData)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {prazoUtilRelativo(p.prazoData)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={prazoStatus(p.prazoData)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-xl text-card-foreground">Atividade recente</h2>
          <ol className="mt-5 space-y-5">
            {atividades.slice(0, 8).map((a) => {
              const Icon = iconePorTipo[a.tipo];
              return (
                <li key={a.id} className="flex gap-3.5">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                    <Icon className="size-4" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-relaxed text-foreground">{a.texto}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(a.data)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      {tarefasAbertas.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
            <h2 className="font-serif text-xl text-card-foreground">Tarefas para hoje</h2>
            <Link
              to="/app/tarefas"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Ver quadro
            </Link>
          </div>
          <div className="divide-y divide-border">
            {tarefasAbertas.slice(0, 5).map((t) => {
              const processo = t.processoId
                ? processos.find((p) => p.id === t.processoId)
                : undefined;
              const atrasada = t.prazo && diasUteisAte(t.prazo) < 0;
              return (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <SquareCheckBig className="size-4" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{t.titulo}</p>
                    {processo && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {clientePorId(processo.clienteId)?.nome} — {processo.tipoAcao}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {t.prioridade === "alta" && <Tag>Alta</Tag>}
                    {t.prazo && (
                      <span
                        className={
                          atrasada ? "text-xs text-destructive" : "text-xs text-muted-foreground"
                        }
                      >
                        {prazoUtilRelativo(t.prazo)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
