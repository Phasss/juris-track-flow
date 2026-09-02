import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, FolderOpen, HardDrive, Plus, Search, Trash2 } from "lucide-react";
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
  Select,
  StatCard,
  Tag,
  Textarea,
} from "@/components/app/ui";
import { categoriaDocumentoLabel, formatBytes, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategoriaDocumento } from "@/lib/mock-data";

export const Route = createFileRoute("/app/documentos/")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: DocumentosPage,
});

const categorias: CategoriaDocumento[] = [
  "peticao",
  "decisao",
  "contrato",
  "procuracao",
  "documento-pessoal",
  "prova",
  "comprovante",
  "outro",
];

const coresExtensao: Record<string, string> = {
  pdf: "bg-destructive/10 text-destructive",
  docx: "bg-primary/10 text-primary",
  doc: "bg-primary/10 text-primary",
  xlsx: "bg-emerald-500/10 text-emerald-700",
  jpg: "bg-accent-soft text-accent-foreground",
  png: "bg-accent-soft text-accent-foreground",
};

function DocumentosPage() {
  const { documentos, processos, clientes, clientePorId, adicionarDocumento, removerDocumento } =
    useApp();

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDocumento | "">("");
  const [clienteId, setClienteId] = useState("");
  const [aberto, setAberto] = useState(false);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return documentos
      .filter((d) => {
        const processo = d.processoId ? processos.find((p) => p.id === d.processoId) : undefined;
        const cliente = d.clienteId ? clientePorId(d.clienteId) : undefined;
        const alvo =
          `${d.nome} ${d.descricao ?? ""} ${d.tags.join(" ")} ${processo?.numero ?? ""} ${cliente?.nome ?? ""}`.toLowerCase();
        return (
          (!termo || alvo.includes(termo)) &&
          (!categoria || d.categoria === categoria) &&
          (!clienteId || d.clienteId === clienteId)
        );
      })
      .sort((a, b) => +new Date(b.data) - +new Date(a.data));
  }, [documentos, busca, categoria, clienteId, processos, clientePorId]);

  const espacoTotal = documentos.reduce((soma, d) => soma + d.tamanhoBytes, 0);
  const semProcesso = documentos.filter((d) => !d.processoId).length;

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Documentos"
        description="Todo o acervo do escritório em um lugar só, vinculado a processos e clientes."
        action={
          <Button variant="accent" onClick={() => setAberto(true)}>
            <Plus className="size-4" strokeWidth={2} />
            Anexar documento
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Documentos"
          valor={documentos.length}
          detalhe="no acervo do escritório"
          icon={<FolderOpen className="size-4.5" strokeWidth={1.5} />}
        />
        <StatCard
          label="Espaço ocupado"
          valor={formatBytes(espacoTotal)}
          detalhe="somando todos os arquivos"
          icon={<HardDrive className="size-4.5" strokeWidth={1.5} />}
        />
        <StatCard
          label="Sem processo"
          valor={semProcesso}
          detalhe="vinculados só ao cliente"
          icon={<FileText className="size-4.5" strokeWidth={1.5} />}
          tone={semProcesso > 0 ? "destaque" : "neutro"}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            value={busca}
            onChange={setBusca}
            placeholder="Buscar por nome, tag, processo ou cliente..."
            className="pl-11"
          />
        </div>
        <Select
          value={categoria}
          onChange={setCategoria}
          placeholder="Todas as categorias"
          options={categorias.map((c) => ({ value: c, label: categoriaDocumentoLabel[c] }))}
        />
        <Select
          value={clienteId}
          onChange={setClienteId}
          placeholder="Todos os clientes"
          options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
        />
      </div>

      {lista.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="size-8" strokeWidth={1.2} />}
          title="Nenhum documento encontrado"
          description="Ajuste a busca ou os filtros para ver outros documentos."
        />
      ) : (
        <Card className="divide-y divide-border">
          {lista.map((doc) => {
            const processo = doc.processoId
              ? processos.find((p) => p.id === doc.processoId)
              : undefined;
            const cliente = doc.clienteId ? clientePorId(doc.clienteId) : undefined;

            return (
              <div key={doc.id} className="flex items-start gap-4 px-6 py-5">
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl text-xs font-medium uppercase",
                    coresExtensao[doc.extensao] ?? "bg-secondary text-primary",
                  )}
                >
                  {doc.extensao}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{doc.nome}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {categoriaDocumentoLabel[doc.categoria]} · {formatBytes(doc.tamanhoBytes)} ·{" "}
                    {formatDate(doc.data)}
                  </p>

                  {doc.descricao && (
                    <p className="mt-2 text-sm text-muted-foreground">{doc.descricao}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {cliente && (
                      <Link
                        to="/app/clientes/$id"
                        params={{ id: cliente.id }}
                        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {cliente.nome}
                      </Link>
                    )}
                    {processo && (
                      <>
                        <span className="text-xs text-muted-foreground">·</span>
                        <Link
                          to="/app/processos/$id"
                          params={{ id: processo.id }}
                          className="font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          {processo.numero}
                        </Link>
                      </>
                    )}
                    {doc.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    title="Protótipo: o arquivo não é armazenado"
                    className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Baixar documento"
                  >
                    <Download className="size-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => removerDocumento(doc.id)}
                    className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remover documento"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <NovoDocumentoModal
        aberto={aberto}
        onFechar={() => setAberto(false)}
        processos={processos}
        clientes={clientes}
        onAdicionar={(d) => {
          adicionarDocumento(d);
          setAberto(false);
        }}
      />
    </div>
  );
}

function NovoDocumentoModal({
  aberto,
  onFechar,
  processos,
  clientes,
  onAdicionar,
}: {
  aberto: boolean;
  onFechar: () => void;
  processos: ReturnType<typeof useApp>["processos"];
  clientes: ReturnType<typeof useApp>["clientes"];
  onAdicionar: ReturnType<typeof useApp>["adicionarDocumento"];
}) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDocumento>("peticao");
  const [processoId, setProcessoId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tags, setTags] = useState("");

  function salvar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    const processo = processos.find((p) => p.id === processoId);
    const extensao = nome.includes(".") ? nome.split(".").pop()!.toLowerCase() : "pdf";

    onAdicionar({
      nome: nome.trim(),
      categoria,
      processoId: processoId || undefined,
      clienteId: clienteId || processo?.clienteId || undefined,
      data: new Date().toISOString(),
      tamanhoBytes: 100_000 + Math.floor(Math.random() * 900_000),
      extensao,
      descricao: descricao.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setNome("");
    setCategoria("peticao");
    setProcessoId("");
    setClienteId("");
    setDescricao("");
    setTags("");
  }

  return (
    <Modal open={aberto} onClose={onFechar} title="Anexar documento" wide>
      <form onSubmit={salvar} className="space-y-4">
        <Field label="Nome do arquivo">
          <Input
            value={nome}
            onChange={setNome}
            placeholder="Ex.: Contrato de honorários.pdf"
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoria">
            <Select
              value={categoria}
              onChange={setCategoria}
              options={categorias.map((c) => ({ value: c, label: categoriaDocumentoLabel[c] }))}
            />
          </Field>
          <Field label="Tags (separadas por vírgula)">
            <Input value={tags} onChange={setTags} placeholder="honorários, assinado" />
          </Field>
          <Field label="Processo (opcional)">
            <Select
              value={processoId}
              onChange={setProcessoId}
              placeholder="Sem processo vinculado"
              options={processos.map((p) => ({
                value: p.id,
                label: `${p.tipoAcao} — ${p.numero}`,
              }))}
            />
          </Field>
          <Field label="Cliente (opcional)">
            <Select
              value={clienteId}
              onChange={setClienteId}
              placeholder="Herdar do processo"
              options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
            />
          </Field>
        </div>

        <Field label="Descrição (opcional)">
          <Textarea value={descricao} onChange={setDescricao} rows={3} />
        </Field>

        <Aviso tone="neutro">
          Protótipo sem armazenamento de arquivos: o registro do documento é criado, mas o arquivo
          em si não é enviado nem guardado.
        </Aviso>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent">
            Anexar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
