import { ListChecks, PlugZap, Send } from "lucide-react";
import { Reveal } from "./Reveal";

const steps = [
  {
    icon: PlugZap,
    title: "Conecte seus processos",
    text: "Integração direta com a API do PJe: os andamentos são importados automaticamente, sem digitação e sem consultas manuais.",
  },
  {
    icon: ListChecks,
    title: "Organize com check-lists",
    text: "Marque etapas e prazos de cada processo e receba lembretes automáticos antes de cada data crítica.",
  },
  {
    icon: Send,
    title: "Comunique-se sem esforço",
    text: "Atualizações e prazos são enviados ao cliente por WhatsApp na hora certa, com a sua linguagem e o seu ritmo.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
            Como funciona
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
            Três passos entre o caos e o controle
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 120}>
              <div className="relative h-full rounded-2xl border border-primary-foreground/12 bg-primary-soft/40 p-7">
                <div className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <s.icon className="size-5" strokeWidth={1.4} />
                  </span>
                  <span className="font-serif text-4xl text-primary-foreground/25">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-serif text-xl text-primary-foreground">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
