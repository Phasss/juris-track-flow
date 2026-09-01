import { Instagram, Linkedin, Scale, Youtube } from "lucide-react";

const socials = [
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Instagram, label: "Instagram" },
  { icon: Youtube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Scale className="size-4.5" strokeWidth={1.5} />
            </span>
            <span className="font-serif text-xl">
              Juris<span className="text-accent">.</span>Track
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/70">
            Prazos sob controle, clientes informados, escritório em ordem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href="#"
              aria-label={s.label}
              className="grid size-10 place-items-center rounded-full border border-primary-foreground/20 transition-colors hover:border-accent hover:text-accent"
            >
              <s.icon className="size-4.5" strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-primary-foreground/12">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-primary-foreground/60 lg:px-8">
          © {new Date().getFullYear()} Juris.Track. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
