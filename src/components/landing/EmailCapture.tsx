import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Reveal } from "./Reveal";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 900);
  }

  return (
    <section id="cadastro" className="bg-background">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface px-6 py-14 text-center shadow-[var(--shadow-card)] sm:px-12">
            <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
              Lista de espera
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Seja um dos primeiros a testar
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Estamos abrindo vagas limitadas para advogados que querem organizar a rotina
              processual desde o primeiro dia.
            </p>

            {status === "done" ? (
              <div className="mx-auto mt-9 flex max-w-md items-center justify-center gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-6 py-5 text-accent-foreground">
                <CheckCircle2 className="size-5 shrink-0" strokeWidth={1.5} />
                <p className="text-sm font-medium">
                  Pronto! Avisaremos você em {email} assim que o acesso abrir.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-9 flex max-w-lg flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="email" className="sr-only">
                  Seu melhor e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@escritorio.adv.br"
                  className="min-w-0 flex-1 rounded-full border border-input bg-background px-5 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-medium text-accent-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:translate-y-0 disabled:opacity-70"
                >
                  {status === "loading" && (
                    <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                  )}
                  Quero ser avisado
                </button>
              </form>
            )}

            <p className="mt-5 text-xs text-muted-foreground">
              Sem spam, só novidades sobre o lançamento.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
