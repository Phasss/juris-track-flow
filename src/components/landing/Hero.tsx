import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Reveal } from "./Reveal";
import mockup from "@/assets/dashboard-mockup.jpg";

const proofs = ["Integração com o PJe", "Avisos por WhatsApp", "Sem cartão de crédito"];

export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 size-[32rem] rounded-full bg-accent/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <Reveal className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground">
            <ShieldCheck className="size-3.5 text-accent" strokeWidth={1.5} />
            Para advogados autônomos e escritórios pequenos
          </span>

          <h1 className="mt-6 font-serif text-4xl leading-[1.1] text-foreground sm:text-5xl lg:text-6xl">
            Nunca mais perca um <em className="not-italic text-accent">prazo processual</em>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            O Juris.Track conecta-se diretamente ao PJe, importa os andamentos dos seus processos
            automaticamente e mantém você e o seu cliente informados por WhatsApp — sem planilhas,
            sem lembretes manuais, sem sustos.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#cadastro"
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-base font-medium text-accent-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Quero testar gratuitamente
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Ver como funciona
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {proofs.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-accent" strokeWidth={1.5} />
                {p}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="min-w-0">
          <div className="relative rounded-3xl border border-border bg-background p-2 shadow-[var(--shadow-lift)]">
            <img
              src={mockup}
              width={1200}
              height={1008}
              alt="Painel do Juris.Track mostrando a linha do tempo de um processo, os próximos prazos e um aviso automático enviado ao cliente por WhatsApp"
              className="w-full rounded-2xl"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
