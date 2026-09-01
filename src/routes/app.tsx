import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AppLayout,
});

function AppLayout() {
  const { autenticado } = useApp();

  if (!autenticado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-5">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <h1 className="font-serif text-2xl text-card-foreground">Sessão necessária</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Entre no painel de demonstração para acessar processos, prazos e clientes.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
