import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, Gavel, MapPin, SquareCheckBig, Timer, Video } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { Badge, Card, EmptyState, SectionTitle, StatCard, Tabs, Tag } from "@/components/app/ui";
import {
  formatDate,
  formatDateLong,
  formatTime,
  modalidadeAudienciaLabel,
  prazoStatus,
  statusAudienciaLabel,
  tipoAudienciaLabel,
} from "@/lib/format";
import { diasUteisAte, prazoUtilRelativo } from "@/lib/prazo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/agenda/")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AgendaPage,
});

type TipoEvento = "audiencia" | "prazo" | "tarefa";
type Filtro = "todos" | TipoEvento;

type Evento = {
  id: string;
  tipo: TipoEvento;
  data: string;
  titulo: string;
  subtitulo: string;
  processoId?: string | undefined;
  detalhe?: string | undefined;
  link?: string | undefined;
  modalidade?: string | undefined;
  status?: string | undefined;
  temHora: boolean;
};

const iconePorTipo: Record<TipoEvento, typeof Gavel> = {
  audiencia: Gavel,
  prazo: Timer,
  tarefa: SquareCheckBig,
};

const rotuloPorTipo: Record<TipoEvento, string> = {
  audiencia: "Audiência",
  prazo: "Prazo",
  tarefa: "Tarefa",
};

function AgendaPage() {
  const { audiencias, processos, tarefas, clientePorId } = useApp();
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const eventos = useMemo<Evento[]>(() => {
    const lista: Evento[] = [];

    for (const a of audiencias) {
      if (a.status === "cancelada") continue;
      const p = processos.find((x) => x.id === a.processoId);
      lista.push({
        id: `aud-${a.id}`,
        tipo: "audiencia",
        data: a.data,
        titulo: `${tipoAudienciaLabel[a.tipo]} — ${p?.tipoAcao ?? "Processo"}`,
        subtitulo: p ? (clientePorId(p.clienteId)?.nome ?? p.numero) : "",
        processoId: a.processoId,
        detalhe: a.local,
        link: a.link,
        modalidade: modalidadeAudienciaLabel[a.modalidade],
        status: statusAudienciaLabel[a.status],
        temHora: true,
      });
    }

    for (const p of processos) {
      lista.push({
        id: `prz-${p.id}`,
        tipo: "prazo",
        data: p.prazoData,
        titulo: p.prazoTipo,
        subtitulo: clientePorId(p.clienteId)?.nome ?? p.numero,
        processoId: p.id,
        detalhe: p.tipoAcao,
        temHora: false,
      });
    }

    for (const t of tarefas) {
      if (!t.prazo || t.status === "concluida") continue;
      const p = t.processoId ? processos.find((x) => x.id === t.processoId) : undefined;
      lista.push({
        id: `tar-${t.id}`,
        tipo: "tarefa",
        data: t.prazo,
        titulo: t.titulo,
        subtitulo: p ? (clientePorId(p.clienteId)?.nome ?? p.numero) : "Sem processo vinculado",
        processoId: t.processoId,
        detalhe: t.descricao,
        temHora: false,
      });
    }

    return lista.sort((a, b) => +new Date(a.data) - +new Date(b.data));
  }, [audiencias, processos, tarefas, clientePorId]);

  const visiveis = filtro === "todos" ? eventos : eventos.filter((e) => e.tipo === filtro);

  const futuros = visiveis.filter((e) => diasUteisAte(e.data) >= 0);
  const atrasados = visiveis.filter((e) => diasUteisAte(e.data) < 0);

  const porDia = useMemo(() => {
    const mapa = new Map<string, Evento[]>();
    for (const e of futuros) {
      const chave = e.data.slice(0, 10);
      const atual = mapa.get(chave) ?? [];
      atual.push(e);
      mapa.set(chave, atual);
    }
    return [...mapa.entries()];
  }, [futuros]);

  const audienciasProximas = eventos.filter(
    (e) => e.tipo === "audiencia" && diasUteisAte(e.data) >= 0,
  ).length;
  const prazosSemana = eventos.filter((e) => {
    const d = diasUteisAte(e.data);
    return e.tipo === "prazo" && d >= 0 && d <= 5;
  }).length;

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Agenda"
        description="Audiências, prazos e tarefas do escritório em uma linha do tempo só."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Compromissos atrasados"
          valor={atrasados.length}
          detalhe="exigem ação imediata"
          icon={<Clock className="size-4.5" strokeWidth={1.5} />}
          tone={atrasados.length > 0 ? "perigo" : "neutro"}
        />
        <StatCard
          label="Prazos em 5 dias úteis"
          valor={prazosSemana}
          detalhe="contagem em dias úteis"
          icon={<Timer className="size-4.5" strokeWidth={1.5} />}
          tone="destaque"
        />
        <StatCard
          label="Audiências designadas"
          valor={audienciasProximas}
          detalhe="ainda por realizar"
          icon={<Gavel className="size-4.5" strokeWidth={1.5} />}
        />
      </div>

      <Tabs
        value={filtro}
        onChange={setFiltro}
        options={[
          { value: "todos", label: "Tudo", badge: eventos.length },
          {
            value: "audiencia",
            label: "Audiências",
            badge: eventos.filter((e) => e.tipo === "audiencia").length,
          },
          {
            value: "prazo",
            label: "Prazos",
            badge: eventos.filter((e) => e.tipo === "prazo").length,
          },
          {
            value: "tarefa",
            label: "Tarefas",
            badge: eventos.filter((e) => e.tipo === "tarefa").length,
          },
        ]}
      />

      {atrasados.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">Atrasados</h2>
          <div className="space-y-3">
            {atrasados.map((e) => (
              <LinhaEvento key={e.id} evento={e} atrasado />
            ))}
          </div>
        </section>
      )}

      {porDia.length === 0 && atrasados.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-8" strokeWidth={1.2} />}
          title="Nada na agenda"
          description="Quando houver audiências, prazos ou tarefas com data, eles aparecem aqui."
        />
      ) : (
        <div className="space-y-8">
          {porDia.map(([dia, doDia]) => (
            <section key={dia} className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h2 className="font-serif text-xl text-foreground capitalize">
                  {formatDateLong(doDia[0]!.data)}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {prazoUtilRelativo(doDia[0]!.data)}
                </span>
              </div>
              <div className="space-y-3">
                {doDia.map((e) => (
                  <LinhaEvento key={e.id} evento={e} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function LinhaEvento({ evento, atrasado }: { evento: Evento; atrasado?: boolean }) {
  const Icone = iconePorTipo[evento.tipo];

  const conteudo = (
    <Card
      className={cn(
        "p-5 transition-transform",
        evento.processoId && "group-hover:-translate-y-0.5",
        atrasado && "border-destructive/30",
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            atrasado ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary",
          )}
        >
          <Icone className="size-4.5" strokeWidth={1.5} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Tag>{rotuloPorTipo[evento.tipo]}</Tag>
            {evento.modalidade && <Tag>{evento.modalidade}</Tag>}
            {evento.temHora && (
              <span className="text-xs text-muted-foreground">{formatTime(evento.data)}</span>
            )}
          </div>
          <p className="mt-2 font-medium text-card-foreground">{evento.titulo}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{evento.subtitulo}</p>
          {evento.detalhe && (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
              {evento.tipo === "audiencia" && (
                <MapPin className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} />
              )}
              {evento.detalhe}
            </p>
          )}
          {evento.link && (
            <a
              href={evento.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-accent-foreground underline underline-offset-4"
            >
              <Video className="size-3.5" strokeWidth={1.5} />
              Entrar na sala virtual
            </a>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm text-foreground">{formatDate(evento.data)}</p>
          <p
            className={cn(
              "mt-0.5 text-xs",
              atrasado ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {prazoUtilRelativo(evento.data)}
          </p>
          {evento.tipo === "prazo" && (
            <div className="mt-2 flex justify-end">
              <Badge
                tone={
                  prazoStatus(evento.data) === "vencido"
                    ? "perigo"
                    : prazoStatus(evento.data) === "atencao"
                      ? "destaque"
                      : "neutro"
                }
              >
                {prazoStatus(evento.data) === "vencido"
                  ? "Vencido"
                  : prazoStatus(evento.data) === "atencao"
                    ? "Atenção"
                    : "No prazo"}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (!evento.processoId) return conteudo;

  return (
    <Link to="/app/processos/$id" params={{ id: evento.processoId }} className="group block">
      {conteudo}
    </Link>
  );
}
