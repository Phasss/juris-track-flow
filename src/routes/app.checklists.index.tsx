import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, Pencil, Plus, Trash2, X } from "lucide-react";
import { useApp } from "@/lib/app-store";
import {
  Aviso,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  SectionTitle,
  Tag,
  Textarea,
} from "@/components/app/ui";
import type { ChecklistTemplate } from "@/lib/mock-data";

export const Route = createFileRoute("/app/checklists/")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: ChecklistsPage,
});

function ChecklistsPage() {
  const { templates, processos, criarTemplate, atualizarTemplate, removerTemplate } = useApp();
  const [editando, setEditando] = useState<ChecklistTemplate | null>(null);
  const [criando, setCriando] = useState(false);

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Check-lists"
        description="Modelos de etapas que você aplica a qualquer processo com um clique."
        action={
          <Button variant="accent" onClick={() => setCriando(true)}>
            <Plus className="size-4" strokeWidth={2} />
            Novo modelo
          </Button>
        }
      />

      <Aviso tone="neutro" icon={<ListChecks className="size-5" strokeWidth={1.5} />}>
        Um modelo transforma o rito que você já conhece em um roteiro pronto. Ao aplicá-lo dentro de
        um processo, todas as etapas entram no check-list de uma vez — e cada uma pode ganhar seu
        próprio prazo.
      </Aviso>

      {templates.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-8" strokeWidth={1.2} />}
          title="Nenhum modelo criado"
          description="Crie modelos para os ritos que você mais atende e ganhe tempo em cada novo processo."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.id} className="flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-serif text-xl text-card-foreground">{t.nome}</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t.descricao}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setEditando(t)}
                    className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Editar modelo"
                  >
                    <Pencil className="size-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => removerTemplate(t.id)}
                    className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remover modelo"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <ol className="mt-5 flex-1 space-y-2.5">
                {t.itens.map((item, i) => (
                  <li key={`${t.id}-${i}`} className="flex gap-3 text-sm">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-xs text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <span className="min-w-0 text-foreground">{item}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-5 border-t border-border pt-4">
                <Tag>
                  {t.itens.length} {t.itens.length === 1 ? "etapa" : "etapas"}
                </Tag>
              </div>
            </Card>
          ))}
        </div>
      )}

      {processos.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Para aplicar um modelo, abra um processo e vá até a aba <strong>Check-list</strong>.
        </p>
      )}

      <TemplateModal
        aberto={criando || editando !== null}
        template={editando}
        onFechar={() => {
          setCriando(false);
          setEditando(null);
        }}
        onSalvar={(dados) => {
          if (editando) atualizarTemplate(editando.id, dados);
          else criarTemplate(dados);
          setCriando(false);
          setEditando(null);
        }}
      />
    </div>
  );
}

function TemplateModal({
  aberto,
  template,
  onFechar,
  onSalvar,
}: {
  aberto: boolean;
  template: ChecklistTemplate | null;
  onFechar: () => void;
  onSalvar: (t: Omit<ChecklistTemplate, "id">) => void;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [itens, setItens] = useState<string[]>([]);
  const [novoItem, setNovoItem] = useState("");
  const [carregadoDe, setCarregadoDe] = useState<string | null>(null);

  // Sincroniza o formulário quando o modal abre para um modelo diferente.
  const chave = template?.id ?? (aberto ? "novo" : null);
  if (aberto && chave !== carregadoDe) {
    setCarregadoDe(chave);
    setNome(template?.nome ?? "");
    setDescricao(template?.descricao ?? "");
    setItens(template?.itens ?? []);
    setNovoItem("");
  }
  if (!aberto && carregadoDe !== null) setCarregadoDe(null);

  function adicionarItem() {
    const v = novoItem.trim();
    if (!v) return;
    setItens((atual) => [...atual, v]);
    setNovoItem("");
  }

  function salvar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim() || itens.length === 0) return;
    onSalvar({ nome: nome.trim(), descricao: descricao.trim(), itens });
  }

  return (
    <Modal
      open={aberto}
      onClose={onFechar}
      title={template ? "Editar modelo" : "Novo modelo de check-list"}
      wide
    >
      <form onSubmit={salvar} className="space-y-4">
        <Field label="Nome do modelo">
          <Input
            value={nome}
            onChange={setNome}
            placeholder="Ex.: Ação Trabalhista Padrão"
            required
          />
        </Field>

        <Field label="Descrição">
          <Textarea
            value={descricao}
            onChange={setDescricao}
            rows={2}
            placeholder="Para que serve este modelo?"
          />
        </Field>

        <div>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Etapas ({itens.length})
          </p>

          {itens.length > 0 && (
            <ol className="mb-3 space-y-2">
              {itens.map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5"
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-xs text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-foreground">{item}</span>
                  <button
                    type="button"
                    onClick={() => setItens((atual) => atual.filter((_, idx) => idx !== i))}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Remover etapa"
                  >
                    <X className="size-4" strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ol>
          )}

          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={novoItem}
              onChange={setNovoItem}
              placeholder="Descreva a etapa e pressione Adicionar"
            />
            <Button type="button" variant="outline" onClick={adicionarItem}>
              <Plus className="size-4" strokeWidth={2} />
              Adicionar
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" disabled={!nome.trim() || itens.length === 0}>
            {template ? "Salvar alterações" : "Criar modelo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
