import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PrazoStatus } from "@/lib/mock-data";
import { statusLabel } from "@/lib/format";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const statusStyles: Record<PrazoStatus, string> = {
  "no-prazo": "bg-secondary text-primary border-border",
  atencao: "bg-accent-soft text-accent-foreground border-accent/40",
  vencido: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: PrazoStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        statusStyles[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabel[status]}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  className,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "accent" | "ghost" | "outline" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-soft",
    accent: "bg-accent text-accent-foreground hover:brightness-95",
    outline: "border border-border bg-background text-foreground hover:bg-secondary",
    ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
    danger: "text-destructive hover:bg-destructive/10",
  } as const;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-3.5 py-2 text-xs" : "px-5 py-2.5 text-sm",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  id,
  required,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  id?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      required={required}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full min-w-0 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        className,
      )}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <p className="font-serif text-lg text-foreground">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-primary/40 p-4 backdrop-blur-sm sm:items-center">
      <div
        className={cn(
          "my-auto w-full rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8",
          wide ? "max-w-2xl" : "max-w-lg",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-xl text-card-foreground">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  id,
  required,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <textarea
      id={id}
      rows={rows}
      required={required}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full min-w-0 resize-y rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        className,
      )}
    />
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  id,
  className,
  placeholder,
}: {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  id?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(
        "w-full min-w-0 appearance-none rounded-xl border border-input bg-background bg-[length:1rem] bg-[right:0.9rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm text-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='1.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-input accent-[var(--accent)]"
      />
      <span className="min-w-0 text-foreground">{label}</span>
    </label>
  );
}

const tones = {
  neutro: "bg-secondary text-muted-foreground border-border",
  primario: "bg-primary/10 text-primary border-primary/20",
  destaque: "bg-accent-soft text-accent-foreground border-accent/40",
  perigo: "bg-destructive/10 text-destructive border-destructive/30",
  sucesso: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
} as const;

export type Tone = keyof typeof tones;

export function Badge({
  children,
  tone = "neutro",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Progress({ valor, total }: { valor: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((valor / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{pct}%</span>
    </div>
  );
}

export function Avatar({ nome, className }: { nome: string; className?: string }) {
  const letra = nome.trim()[0]?.toUpperCase() ?? "?";
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full bg-primary font-serif text-lg text-primary-foreground",
        className,
      )}
    >
      {letra}
    </span>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<{ value: T; label: string; badge?: number }>;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border">
      {options.map((o) => {
        const ativo = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              ativo
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
            {typeof o.badge === "number" && o.badge > 0 && (
              <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                {o.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Aviso({
  tone = "neutro",
  icon,
  children,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const fundos: Record<Tone, string> = {
    neutro: "border-border bg-surface",
    primario: "border-primary/20 bg-primary/5",
    destaque: "border-accent/40 bg-accent-soft/50",
    perigo: "border-destructive/30 bg-destructive/5",
    sucesso: "border-emerald-500/30 bg-emerald-500/5",
  };
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border px-5 py-4", fundos[tone])}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 text-sm text-foreground">{children}</div>
    </div>
  );
}

/** Par rótulo/valor usado nas fichas de processo e cliente. */
export function Dado({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-1 text-sm break-words text-foreground">{children}</div>
    </div>
  );
}

export function StatCard({
  label,
  valor,
  detalhe,
  icon,
  tone = "neutro",
}: {
  label: string;
  valor: ReactNode;
  detalhe?: string;
  icon?: ReactNode;
  tone?: Tone;
}) {
  const cores: Record<Tone, string> = {
    neutro: "bg-secondary text-primary",
    primario: "bg-primary/10 text-primary",
    destaque: "bg-accent-soft text-accent-foreground",
    perigo: "bg-destructive/10 text-destructive",
    sucesso: "bg-emerald-500/10 text-emerald-700",
  };
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-3 font-serif text-4xl text-card-foreground">{valor}</p>
          {detalhe && <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p>}
        </div>
        {icon && (
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", cores[tone])}>
            {icon}
          </span>
        )}
      </div>
    </Card>
  );
}
