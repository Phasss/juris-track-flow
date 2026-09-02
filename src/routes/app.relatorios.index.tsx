import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BarChart3, Gavel, TrendingUp, Users, Wallet } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { Card, EmptyState, SectionTitle, StatCard, Tag } from "@/components/app/ui";
import { faseLabel, formatCurrency, formatDate, prazoStatus } from "@/lib/format";
import { diasUteisAte } from "@/lib/prazo";
import { cn } from "@/lib/utils";
import type { FaseProcesso } from "@/lib/mock-data";

export const Route = createFileRoute("/app/relatorios/")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { processos, clientes, tarefas, audiencias, documentos, clientePorId, mensagens } =
    useApp();

  const valorTotal = processos.reduce((s, p) => s + (p.valorCausa ?? 0), 0);

  const porFase = useMemo(() => {
    const mapa = new Map<FaseProcesso, number>();
    for (const p of processos) mapa.set(p.fase, (mapa.get(p.fase) ?? 0) + 1);
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  }, [processos]);

  const porTipoAcao = useMemo(() => {
    const mapa = new Map<string, { qtd: number; valor: number }>();
    for (const p of processos) {
      const atual = mapa.get(p.tipoAcao) ?? { qtd: 0, valor: 0 };
      mapa.set(p.tipoAcao, { qtd: atual.qtd + 1, valor: atual.valor + (p.valorCausa ?? 0) });
    }
    return [...mapa.entries()].sort((a, b) => b[1].qtd - a[1].qtd);
  }, [processos]);

  const porCliente = useMemo(
    () =>
      clientes
        .map((c) => {
          const meus = processos.filter((p) => p.clienteId === c.id);
          return {
            cliente: c,
            qtd: meus.length,
            valor: meus.reduce((s, p) => s + (p.valorCausa ?? 0), 0),
            vencidos: meus.filter((p) => prazoStatus(p.prazoData) === "vencido").length,
          };
        })
        .filter((x) => x.qtd > 0)
        .sort((a, b) => b.valor - a.valor),
    [clientes, processos],
  );

  const porTribunal = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of processos) mapa.set(p.tribunal, (mapa.get(p.tribunal) ?? 0) + 1);
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  }, [processos]);

  const vencidos = processos.filter((p) => prazoStatus(p.prazoData) === "vencido");
  const emAtencao = processos.filter((p) => prazoStatus(p.prazoData) === "atencao");
  const tarefasConcluidas = tarefas.filter((t) => t.status === "concluida").length;
  const taxaConclusao =
    tarefas.length === 0 ? 0 : Math.round((tarefasConcluidas / tarefas.length) * 100);
  const paradosMuito = processos.filter((p) => diasUteisAte(p.ultimaMovimentacao) < -30);

  const maxTipo = Math.max(1, ...porTipoAcao.map(([, v]) => v.qtd));
  const maxFase = Math.max(1, ...porFase.map(([, v]) => v));

  if (processos.length === 0) {
    return (
      <div className="space-y-8">
        <SectionTitle title="Relatórios" description="Visão gerencial da carteira do escritório." />
        <EmptyState
          icon={<BarChart3 className="size-8" strokeWidth={1.2} />}
          title="Sem dados para analisar"
          description="Cadastre processos para ver os indicadores da carteira aqui."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Relatórios"
        description="Como está a carteira, onde está o risco e para onde vai o seu tempo."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Processos ativos"
          valor={processos.length}
          detalhe={`${clientes.length} clientes`}
          icon={<Gavel className="size-4.5" strokeWidth={1.5} />}
        />
        <StatCard
          label="Valor sob patrocínio"
          valor={
            <span className="text-2xl">
              {valorTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              })}
            </span>
          }
          detalhe="soma dos valores da causa"
          icon={<Wallet className="size-4.5" strokeWidth={1.5} />}
        />
        <StatCard
          label="Prazos vencidos"
          valor={vencidos.length}
          detalhe={`${emAtencao.length} vencendo em breve`}
          icon={<AlertTriangle className="size-4.5" strokeWidth={1.5} />}
          tone={vencidos.length > 0 ? "perigo" : "sucesso"}
        />
        <StatCard
          label="Tarefas concluídas"
          valor={`${taxaConclusao}%`}
          detalhe={`${tarefasConcluidas} de ${tarefas.length}`}
          icon={<TrendingUp className="size-4.5" strokeWidth={1.5} />}
          tone="sucesso"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 sm:p-8">
          <h2 className="font-serif text-xl text-card-foreground">Carteira por tipo de ação</h2>
          <div className="mt-6 space-y-4">
            {porTipoAcao.map(([tipo, dados]) => (
              <div key={tipo}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate text-sm text-foreground">{tipo}</p>
                  <p className="shrink-0 text-sm text-muted-foreground tabular-nums">{dados.qtd}</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{ width: `${(dados.qtd / maxTipo) * 100}%` }}
                  />
                </div>
                {dados.valor > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatCurrency(dados.valor)} em causas
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="font-serif text-xl text-card-foreground">Distribuição por fase</h2>
          <div className="mt-6 space-y-4">
            {porFase.map(([fase, qtd]) => (
              <div key={fase}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm text-foreground">{faseLabel[fase]}</p>
                  <p className="shrink-0 text-sm text-muted-foreground tabular-nums">{qtd}</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-700"
                    style={{ width: `${(qtd / maxFase) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Por tribunal
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {porTribunal.map(([t, qtd]) => (
                <Tag key={t}>
                  {t} · {qtd}
                </Tag>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-6 py-5">
          <h2 className="font-serif text-xl text-card-foreground">Clientes por relevância</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ordenado pelo valor total das causas sob patrocínio.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Processos</th>
                <th className="px-6 py-3 font-medium">Valor das causas</th>
                <th className="px-6 py-3 font-medium">Prazos vencidos</th>
              </tr>
            </thead>
            <tbody>
              {porCliente.map((linha) => (
                <tr
                  key={linha.cliente.id}
                  className="border-b border-border/70 last:border-0 hover:bg-secondary/60"
                >
                  <td className="px-6 py-4">
                    <Link
                      to="/app/clientes/$id"
                      params={{ id: linha.cliente.id }}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {linha.cliente.nome}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground tabular-nums">{linha.qtd}</td>
                  <td className="px-6 py-4 text-muted-foreground tabular-nums">
                    {formatCurrency(linha.valor)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "tabular-nums",
                        linha.vencidos > 0 ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {linha.vencidos}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 sm:p-8">
          <h2 className="font-serif text-xl text-card-foreground">Processos parados</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sem movimentação há mais de 30 dias úteis — vale conferir no PJe.
          </p>
          {paradosMuito.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Nenhum processo parado. Carteira em dia.
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {paradosMuito.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/app/processos/$id"
                    params={{ id: p.id }}
                    className="group block min-w-0"
                  >
                    <p className="truncate text-sm font-medium text-foreground group-hover:underline">
                      {clientePorId(p.clienteId)?.nome}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.tipoAcao} · última movimentação em {formatDate(p.ultimaMovimentacao)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="font-serif text-xl text-card-foreground">Atividade do escritório</h2>
          <dl className="mt-6 space-y-4">
            {[
              { label: "Audiências designadas", valor: audiencias.length, icone: Gavel },
              { label: "Documentos no acervo", valor: documentos.length, icone: BarChart3 },
              { label: "Mensagens enviadas a clientes", valor: mensagens.length, icone: Users },
              {
                label: "Tarefas em aberto",
                valor: tarefas.filter((t) => t.status !== "concluida").length,
                icone: TrendingUp,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <dt className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <item.icone className="size-4" strokeWidth={1.5} />
                  </span>
                  {item.label}
                </dt>
                <dd className="font-serif text-2xl text-card-foreground tabular-nums">
                  {item.valor}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
