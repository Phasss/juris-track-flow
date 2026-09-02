import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleDot,
  Plus,
  SquareCheckBig,
  Trash2,
} from "lucide-react";
import { useApp } from "@/lib/app-store";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  SectionTitle,
  Select,
  StatCard,
  Textarea,
} from "@/components/app/ui";
import { formatDate, prioridadeLabel, statusTarefaLabel } from "@/lib/format";
import { diasUteisAte, prazoUtilRelativo } from "@/lib/prazo";
import { cn } from "@/lib/utils";
import type { PrioridadeTarefa, StatusTarefa, Tarefa } from "@/lib/mock-data";

export const Route = createFileRoute("/app/tarefas/")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: TarefasPage,
});

const colunas: Array<{ status: StatusTarefa; icone: typeof Circle }> = [
  { status: "pendente", icone: Circle },
  { status: "em-andamento", icone: CircleDot },
  { status: "concluida", icone: CheckCircle2 },
];

const ordemPrioridade: Record<PrioridadeTarefa, number> = { alta: 0, media: 1, baixa: 2 };

function TarefasPage() {
  const { tarefas, processos, clientePorId, criarTarefa, atualizarTarefa, removerTarefa } =
    useApp();
  const [aberto, setAberto] = useState(false);

  const porStatus = useMemo(() => {
    const mapa: Record<StatusTarefa, Tarefa[]> = {
      pendente: [],
      "em-andamento": [],
      concluida: [],
    };
    for (const t of tarefas) mapa[t.status].push(t);
    for (const chave of Object.keys(mapa) as StatusTarefa[]) {
      mapa[chave].sort((a, b) => {
        const p = ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade];
        if (p !== 0) return p;
        if (a.prazo && b.prazo) return +new Date(a.prazo) - +new Date(b.prazo);
        return a.prazo ? -1 : b.prazo ? 1 : 0;
      });
    }
    return mapa;
  }, [tarefas]);

  const atrasadas = tarefas.filter(
    (t) => t.status !== "concluida" && t.prazo && diasUteisAte(t.prazo) < 0,
  ).length;
  const abertas = tarefas.filter((t) => t.status !== "concluida").length;
  const concluidas = tarefas.filter((t) => t.status === "concluida").length;

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Tarefas"
        description="O trabalho do escritório organizado por status, prioridade e prazo."
        action={
          <Button variant="accent" onClick={() => setAberto(true)}>
            <Plus className="size-4" strokeWidth={2} />
            Nova tarefa
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Em aberto"
          valor={abertas}
          detalhe="pendentes e em andamento"
          icon={<SquareCheckBig className="size-4.5" strokeWidth={1.5} />}
        />
        <StatCard
          label="Atrasadas"
          valor={atrasadas}
          detalhe="prazo já vencido"
          icon={<Circle className="size-4.5" strokeWidth={1.5} />}
          tone={atrasadas > 0 ? "perigo" : "neutro"}
        />
        <StatCard
          label="Concluídas"
          valor={concluidas}
          detalhe="histórico do escritório"
          icon={<CheckCircle2 className="size-4.5" strokeWidth={1.5} />}
          tone="sucesso"
        />
      </div>

      {tarefas.length === 0 ? (
        <EmptyState
          icon={<SquareCheckBig className="size-8" strokeWidth={1.2} />}
          title="Nenhuma tarefa criada"
          description="Registre o que precisa ser feito para não depender só da memória."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {colunas.map(({ status, icone: Icone }) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Icone className="size-4 text-muted-foreground" strokeWidth={1.5} />
                <h2 className="font-medium text-foreground">{statusTarefaLabel[status]}</h2>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {porStatus[status].length}
                </span>
              </div>

              <div className="space-y-3">
                {porStatus[status].length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                    Nada aqui
                  </div>
                ) : (
                  porStatus[status].map((t) => {
                    const processo = t.processoId
                      ? processos.find((p) => p.id === t.processoId)
                      : undefined;
                    const atrasada =
                      t.status !== "concluida" && t.prazo && diasUteisAte(t.prazo) < 0;

                    return (
                      <Card key={t.id} className={cn("p-5", atrasada && "border-destructive/30")}>
                        <div className="flex items-start justify-between gap-3">
                          <p
                            className={cn(
                              "min-w-0 text-sm font-medium",
                              t.status === "concluida"
                                ? "text-muted-foreground line-through"
                                : "text-card-foreground",
                            )}
                          >
                            {t.titulo}
                          </p>
                          <button
                            onClick={() => removerTarefa(t.id)}
                            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                            aria-label="Remover tarefa"
                          >
                            <Trash2 className="size-4" strokeWidth={1.5} />
                          </button>
                        </div>

                        {t.descricao && (
                          <p className="mt-2 text-sm text-muted-foreground">{t.descricao}</p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge
                            tone={
                              t.prioridade === "alta"
                                ? "perigo"
                                : t.prioridade === "media"
                                  ? "destaque"
                                  : "neutro"
                            }
                          >
                            {prioridadeLabel[t.prioridade]}
                          </Badge>
                          {t.prazo && (
                            <span
                              className={cn(
                                "text-xs",
                                atrasada ? "text-destructive" : "text-muted-foreground",
                              )}
                            >
                              {formatDate(t.prazo)} · {prazoUtilRelativo(t.prazo)}
                            </span>
                          )}
                        </div>

                        {processo && (
                          <Link
                            to="/app/processos/$id"
                            params={{ id: processo.id }}
                            className="mt-3 block truncate text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            {clientePorId(processo.clienteId)?.nome} — {processo.tipoAcao}
                          </Link>
                        )}

                        <div className="mt-4 flex gap-2 border-t border-border pt-3">
                          {status !== "pendente" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => atualizarTarefa(t.id, { status: "pendente" })}
                            >
                              Reabrir
                            </Button>
                          )}
                          {status === "pendente" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => atualizarTarefa(t.id, { status: "em-andamento" })}
                            >
                              Iniciar
                              <ArrowRight className="size-3.5" strokeWidth={1.5} />
                            </Button>
                          )}
                          {status !== "concluida" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => atualizarTarefa(t.id, { status: "concluida" })}
                            >
                              Concluir
                              <CheckCircle2 className="size-3.5" strokeWidth={1.5} />
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <NovaTarefaModal
        aberto={aberto}
        onFechar={() => setAberto(false)}
        processos={processos}
        onCriar={(t) => {
          criarTarefa(t);
          setAberto(false);
        }}
      />
    </div>
  );
}

function NovaTarefaModal({
  aberto,
  onFechar,
  processos,
  onCriar,
}: {
  aberto: boolean;
  onFechar: () => void;
  processos: ReturnType<typeof useApp>["processos"];
  onCriar: ReturnType<typeof useApp>["criarTarefa"];
}) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [processoId, setProcessoId] = useState("");
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>("media");
  const [prazo, setPrazo] = useState("");

  function salvar(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    onCriar({
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      processoId: processoId || undefined,
      prioridade,
      status: "pendente",
      prazo: prazo ? new Date(`${prazo}T12:00:00`).toISOString() : undefined,
    });
    setTitulo("");
    setDescricao("");
    setProcessoId("");
    setPrioridade("media");
    setPrazo("");
  }

  return (
    <Modal open={aberto} onClose={onFechar} title="Nova tarefa">
      <form onSubmit={salvar} className="space-y-4">
        <Field label="O que precisa ser feito?">
          <Input value={titulo} onChange={setTitulo} required placeholder="Título da tarefa" />
        </Field>
        <Field label="Detalhes (opcional)">
          <Textarea value={descricao} onChange={setDescricao} rows={3} />
        </Field>
        <Field label="Processo vinculado (opcional)">
          <Select
            value={processoId}
            onChange={setProcessoId}
            placeholder="Sem processo vinculado"
            options={processos.map((p) => ({ value: p.id, label: `${p.tipoAcao} — ${p.numero}` }))}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prioridade">
            <Select
              value={prioridade}
              onChange={setPrioridade}
              options={[
                { value: "alta", label: "Alta" },
                { value: "media", label: "Média" },
                { value: "baixa", label: "Baixa" },
              ]}
            />
          </Field>
          <Field label="Prazo (opcional)">
            <Input type="date" value={prazo} onChange={setPrazo} />
          </Field>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent">
            Criar tarefa
          </Button>
        </div>
      </form>
    </Modal>
  );
}
