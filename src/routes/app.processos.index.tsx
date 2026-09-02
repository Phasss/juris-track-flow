import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Gavel, Lock, Plus, Search } from "lucide-react";
import { useApp } from "@/lib/app-store";
import {
  Badge,
  Card,
  EmptyState,
  Input,
  SectionTitle,
  Select,
  StatusBadge,
} from "@/components/app/ui";
import { faseLabel, formatDate, prazoStatus } from "@/lib/format";
import { prazoUtilRelativo } from "@/lib/prazo";
import { cn } from "@/lib/utils";
import type { FaseProcesso } from "@/lib/mock-data";

export const Route = createFileRoute("/app/processos/")({
  component: ProcessosPage,
});

const filtros = [
  { id: "todos", label: "Todos" },
  { id: "atencao", label: "Prazo próximo" },
  { id: "vencido", label: "Vencidos" },
] as const;

const fases: FaseProcesso[] = ["conhecimento", "instrucao", "recursal", "execucao", "arquivado"];

function ProcessosPage() {
  const { processos, clientePorId } = useApp();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<(typeof filtros)[number]["id"]>("todos");
  const [fase, setFase] = useState<FaseProcesso | "">("");

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return processos
      .filter((p) => {
        const cliente = clientePorId(p.clienteId)?.nome.toLowerCase() ?? "";
        const casaBusca =
          !termo ||
          cliente.includes(termo) ||
          p.numero.toLowerCase().includes(termo) ||
          p.statusAtual.toLowerCase().includes(termo) ||
          p.tipoAcao.toLowerCase().includes(termo) ||
          p.parteContraria.toLowerCase().includes(termo);
        const status = prazoStatus(p.prazoData);
        const casaFiltro =
          filtro === "todos" ||
          (filtro === "atencao" && status === "atencao") ||
          (filtro === "vencido" && status === "vencido");
        const casaFase = !fase || p.fase === fase;
        return casaBusca && casaFiltro && casaFase;
      })
      .sort((a, b) => +new Date(a.prazoData) - +new Date(b.prazoData));
  }, [processos, busca, filtro, fase, clientePorId]);

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Processos"
        description="Toda a carteira em um só lugar, ordenada pelo prazo mais próximo."
        action={
          <Link
            to="/app/processos/novo"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[filter] hover:brightness-95"
          >
            <Plus className="size-4" strokeWidth={2} />
            Novo processo
          </Link>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_13rem_auto] lg:items-center">
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            value={busca}
            onChange={setBusca}
            placeholder="Buscar por cliente, número, parte contrária ou status..."
            className="pl-11"
          />
        </div>
        <Select
          value={fase}
          onChange={setFase}
          placeholder="Todas as fases"
          options={fases.map((f) => ({ value: f, label: faseLabel[f] }))}
        />
        <div className="flex gap-2 overflow-x-auto">
          {filtros.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                filtro === f.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {lista.length === 0 ? (
        <EmptyState
          icon={<Gavel className="size-8" strokeWidth={1.2} />}
          title="Nenhum processo encontrado"
          description="Ajuste a busca ou os filtros para ver outros processos da carteira."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3.5 font-medium">Cliente</th>
                  <th className="px-6 py-3.5 font-medium">Número</th>
                  <th className="px-6 py-3.5 font-medium">Tipo de ação</th>
                  <th className="px-6 py-3.5 font-medium">Fase</th>
                  <th className="px-6 py-3.5 font-medium">Última mov.</th>
                  <th className="px-6 py-3.5 font-medium">Prazo mais próximo</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/70 transition-colors last:border-0 hover:bg-secondary/60"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to="/app/processos/$id"
                        params={{ id: p.id }}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {clientePorId(p.clienteId)?.nome}
                      </Link>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        vs. {p.parteContraria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-muted-foreground">{p.numero}</span>
                      <span className="mt-1 flex items-center gap-1.5">
                        {p.origem === "pje" && (
                          <span className="text-[0.6875rem] text-muted-foreground">PJe</span>
                        )}
                        {p.segredoJustica && (
                          <Lock className="size-3 text-destructive" strokeWidth={2} />
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.tipoAcao}</td>
                    <td className="px-6 py-4">
                      <Badge tone="neutro">{faseLabel[p.fase]}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {formatDate(p.ultimaMovimentacao)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={prazoStatus(p.prazoData)} />
                        <span className="text-xs whitespace-nowrap text-muted-foreground">
                          {prazoUtilRelativo(p.prazoData)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
