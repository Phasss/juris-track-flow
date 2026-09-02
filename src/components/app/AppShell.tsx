import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  FolderOpen,
  Gavel,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Plus,
  Scale,
  Settings,
  SquareCheckBig,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-store";

const grupos = [
  {
    titulo: null,
    itens: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/app/processos", label: "Processos", icon: Gavel, exact: false },
      { to: "/app/clientes", label: "Clientes", icon: Users, exact: false },
    ],
  },
  {
    titulo: "Rotina",
    itens: [
      { to: "/app/agenda", label: "Agenda", icon: CalendarDays, exact: false },
      { to: "/app/tarefas", label: "Tarefas", icon: SquareCheckBig, exact: false },
      { to: "/app/documentos", label: "Documentos", icon: FolderOpen, exact: false },
    ],
  },
  {
    titulo: "Escritório",
    itens: [
      { to: "/app/relatorios", label: "Relatórios", icon: BarChart3, exact: false },
      { to: "/app/checklists", label: "Check-lists", icon: ListChecks, exact: false },
      { to: "/app/configuracoes", label: "Configurações", icon: Settings, exact: false },
    ],
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { perfil, sair, tarefas, processos } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  const tarefasAbertas = tarefas.filter((t) => t.status !== "concluida").length;

  const contadores: Record<string, number> = {
    "/app/processos": processos.length,
    "/app/tarefas": tarefasAbertas,
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-primary text-primary-foreground">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Scale className="size-4.5" strokeWidth={1.5} />
        </span>
        <span className="font-serif text-xl">
          Juris<span className="text-accent">.</span>Track
        </span>
      </div>

      <div className="px-3 pb-4">
        <Link
          to="/app/processos/novo"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-3.5 py-2.5 text-sm font-medium text-accent-foreground transition-[filter] hover:brightness-95"
        >
          <Plus className="size-4" strokeWidth={2} />
          Novo processo
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {grupos.map((grupo, i) => (
          <div key={grupo.titulo ?? `grupo-${i}`} className="space-y-1">
            {grupo.titulo && (
              <p className="px-3.5 pb-1 text-[0.6875rem] font-medium tracking-wider text-primary-foreground/40 uppercase">
                {grupo.titulo}
              </p>
            )}
            {grupo.itens.map((item) => {
              const contador = contadores[item.to];
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors",
                    isActive(item.to, item.exact)
                      ? "bg-primary-foreground/10 text-primary-foreground"
                      : "text-primary-foreground/65 hover:bg-primary-foreground/5 hover:text-primary-foreground",
                  )}
                >
                  <item.icon className="size-4.5 shrink-0" strokeWidth={1.5} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {typeof contador === "number" && contador > 0 && (
                    <span className="shrink-0 rounded-full bg-primary-foreground/10 px-2 py-0.5 text-xs tabular-nums">
                      {contador}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-primary-foreground/12 p-4">
        <div className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
            {perfil.responsavel.split(" ").slice(-1)[0]?.[0] ?? "A"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm">{perfil.responsavel}</p>
            <p className="truncate text-xs text-primary-foreground/60">{perfil.oab}</p>
          </div>
        </div>
        <Link
          to="/"
          onClick={sair}
          className="mt-2 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-primary-foreground/65 transition-colors hover:bg-primary-foreground/5 hover:text-primary-foreground"
        >
          <LogOut className="size-4.5 shrink-0" strokeWidth={1.5} />
          Sair
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-primary/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
          <button
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="absolute top-5 left-[17rem] grid size-10 place-items-center rounded-full bg-background text-foreground"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/85 px-5 py-3.5 backdrop-blur-md lg:hidden">
          <button
            aria-label="Abrir menu"
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-border text-foreground"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>
          <span className="font-serif text-lg">
            Juris<span className="text-accent">.</span>Track
          </span>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
