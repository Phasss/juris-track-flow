import { AlarmClock, FolderSearch, MessagesSquare } from "lucide-react";
import { Reveal } from "./Reveal";

const pains = [
  {
    icon: AlarmClock,
    title: "Prazos perdidos",
    text: "Acompanhamento manual, planilhas e anotações soltas: basta um dia corrido para um prazo fatal passar despercebido.",
  },
  {
    icon: FolderSearch,
    title: "Tudo espalhado",
    text: "Documentos no e-mail, andamentos no PJe, contratos no WhatsApp. Encontrar uma informação vira uma pequena investigação.",
  },
  {
    icon: MessagesSquare,
    title: "Cliente ansioso",
    text: "“E o meu processo, doutor?” — mensagens toda hora, interrompendo o trabalho que realmente exige a sua atenção.",
  },
];

export function Problem() {
  return (
    <section id="problema" className="bg-background">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">O problema</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Advogado autônomo não pode viver apagando incêndio
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            A rotina de quem cuida sozinho da própria carteira de processos é feita de urgências. E
            urgência crônica cobra caro: em tempo, em tranquilidade e em confiança do cliente.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {pains.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 100}>
              <div className="h-full rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                  <p.icon className="size-5" strokeWidth={1.4} />
                </span>
                <h3 className="mt-5 font-serif text-xl text-card-foreground">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
