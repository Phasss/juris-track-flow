import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarClock, FileClock, Gavel, MessageCircle, Timer } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { Card, SectionTitle, StatusBadge } from "@/components/app/ui";
import { diasAte, formatDate, formatDateTime, prazoRelativo, prazoStatus } from "@/lib/format";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

const iconePorTipo = {
  andamento: Gavel,
  prazo: Timer,
  mensagem: MessageCircle,
} as const;

function DashboardPage() {
  const { processos, clientePorId, atividades, perfil } = useApp();

  const prazosSemana = processos.filter((p) => {
    const dias = diasAte(p.prazoData);
    return dias >= 0 && dias <= 7;
  });
  const semAtualizacao = processos.filter((p) => diasAte(p.ultimaMovimentacao) < -30);
  const vencidos = processos.filter((p) => diasAte(p.prazoData) < 0);

  const proximos = [...processos].sort((a, b) => +new Date(a.prazoData) - +new Date(b.prazoData));

  const resumo = [
    {
      label: "Processos ativos",
      valor: processos.length,
      detalhe: "carteira em andamento",
      icon: Gavel,
    },
    {
      label: "Prazos nesta semana",
      valor: prazosSemana.length,
      detalhe: "vencem em até 7 dias",
      icon: CalendarClock,
    },
    {
      label: "Sem atualização recente",
      valor: semAtualizacao.length,
      detalhe: "há mais de 30 dias",
      icon: FileClock,
    },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle
        title={`Bom trabalho, ${perfil.responsavel.split(" ").slice(0, 2).join(" ")}`}
        description="Visão geral da sua carteira de processos e dos prazos mais próximos."
      />

      {vencidos.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" strokeWidth={1.5} />
          <p className="text-sm text-foreground">
            <strong className="font-medium">
              {vencidos.length} prazo{vencidos.length > 1 ? "s" : ""} vencido
              {vencidos.length > 1 ? "s" : ""}
            </strong>{" "}
            precisa da sua atenção imediata.
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resumo.map((r) => (
          <Card key={r.label} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {r.label}
                </p>
                <p className="mt-3 font-serif text-4xl text-card-foreground">{r.valor}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.detalhe}</p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <r.icon className="size-4.5" strokeWidth={1.5} />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-serif text-xl text-card-foreground">Próximos prazos</h2>
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
                  <tr key={p.id} className="border-b border-border/70 last:border-0 hover:bg-secondary/60">
                    <td className="px-6 py-4">
                      <Link
                        to="/app/processos/$id"
                        params={{ id: p.id }}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {clientePorId(p.clienteId)?.nome}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{p.numero}</td>
                    <td className="px-6 py-4 text-muted-foreground">{p.prazoTipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-foreground">{formatDate(p.prazoData)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {prazoRelativo(p.prazoData)}
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
            {atividades.slice(0, 7).map((a) => {
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
    </div>
  );
}
