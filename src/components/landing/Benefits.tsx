import { BellRing, Layers, Timer, UserCheck } from "lucide-react";
import { Reveal } from "./Reveal";

const benefits = [
  {
    icon: BellRing,
    title: "Nunca perca um prazo",
    text: "Alertas automáticos com antecedência configurável para cada etapa processual.",
  },
  {
    icon: UserCheck,
    title: "Cliente informado",
    text: "Ele acompanha o andamento por WhatsApp, sem que você precise redigir nada.",
  },
  {
    icon: Layers,
    title: "Tudo em um só lugar",
    text: "Processos, prazos, documentos e histórico de conversas centralizados.",
  },
  {
    icon: Timer,
    title: "Menos burocracia",
    text: "Menos tempo administrativo, mais tempo advogando de verdade.",
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">Benefícios</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Segurança processual todos os dias
          </h2>
        </Reveal>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <Reveal as="li" key={b.title} delay={i * 90}>
              <div className="h-full rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1">
                <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-foreground">
                  <b.icon className="size-5" strokeWidth={1.4} />
                </span>
                <h3 className="mt-5 font-serif text-lg text-card-foreground">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
