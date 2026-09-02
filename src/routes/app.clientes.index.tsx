import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, Search, Users } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { Card, EmptyState, Input, SectionTitle, Tag } from "@/components/app/ui";

export const Route = createFileRoute("/app/clientes/")({
  component: ClientesPage,
});

function ClientesPage() {
  const { clientes, processosDoCliente } = useApp();
  const [busca, setBusca] = useState("");

  const lista = clientes.filter((c) =>
    `${c.nome} ${c.email} ${c.telefone}`.toLowerCase().includes(busca.trim().toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Clientes"
        description="Contatos vinculados aos processos e histórico de comunicação."
      />

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          value={busca}
          onChange={setBusca}
          placeholder="Buscar cliente..."
          className="pl-11"
        />
      </div>

      {lista.length === 0 ? (
        <EmptyState
          icon={<Users className="size-8" strokeWidth={1.2} />}
          title="Nenhum cliente encontrado"
          description="Tente buscar por outro nome, e-mail ou telefone."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((c) => {
            const qtd = processosDoCliente(c.id).length;
            return (
              <Link key={c.id} to="/app/clientes/$id" params={{ id: c.id }} className="group">
                <Card className="h-full p-6 transition-transform group-hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-serif text-lg text-primary-foreground">
                      {c.nome[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-card-foreground">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {qtd} processo{qtd === 1 ? "" : "s"} vinculado{qtd === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Phone className="size-4 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{c.telefone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="size-4 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{c.email}</span>
                    </p>
                  </div>
                  <div className="mt-5">
                    <Tag>Ver histórico</Tag>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
