import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Scale, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { Button, Field, Input } from "@/components/app/ui";

const title = "Entrar — Juris.Track";
const description = "Acesse o painel do Juris.Track e acompanhe processos, prazos e clientes.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { entrar } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("ana.almeida@almeidaadvocacia.adv.br");
  const [senha, setSenha] = useState("demonstracao");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    entrar(email);
    void navigate({ to: "/app" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Scale className="size-4.5" strokeWidth={1.5} />
          </span>
          <span className="font-serif text-xl">
            Juris<span className="text-accent">.</span>Track
          </span>
        </Link>
        <div>
          <h2 className="max-w-md font-serif text-4xl leading-tight">
            Prazos sob controle, clientes informados, escritório em ordem.
          </h2>
          <p className="mt-5 max-w-md text-sm text-primary-foreground/70">
            Ambiente de demonstração com dados fictícios. As integrações com o PJe e com o WhatsApp
            serão conectadas nas próximas etapas.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/50">© {new Date().getFullYear()} Juris.Track</p>
      </div>

      <div className="flex items-center justify-center bg-background px-5 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-foreground">Acesse sua conta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Login de demonstração — qualquer e-mail e senha funcionam.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field label="E-mail">
              <Input type="email" value={email} onChange={setEmail} required />
            </Field>
            <Field label="Senha">
              <Input type="password" value={senha} onChange={setSenha} required />
            </Field>
            <Button type="submit" variant="accent" className="w-full">
              Entrar no painel
            </Button>
          </form>

          <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.5} />
            Protótipo sem backend: nenhum dado real é enviado ou armazenado.
          </p>

          <Link
            to="/"
            className="mt-8 inline-block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
