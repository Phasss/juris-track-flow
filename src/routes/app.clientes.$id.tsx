import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  FileText,
  Gavel,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import { useApp } from "@/lib/app-store";
import {
  Avatar,
  Aviso,
  Badge,
  Button,
  Card,
  Dado,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  StatusBadge,
  Tabs,
  Textarea,
} from "@/components/app/ui";
import {
  categoriaDocumentoLabel,
  formatBytes,
  formatDate,
  formatDateTime,
  prazoStatus,
} from "@/lib/format";
import { prazoUtilRelativo } from "@/lib/prazo";

export const Route = createFileRoute("/app/clientes/$id")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: ClienteDetalhePage,
});

type Aba = "processos" | "comunicacao" | "documentos" | "dados";

function ClienteDetalhePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    clientePorId,
    processosDoCliente,
    mensagensDoCliente,
    documentosDoCliente,
    templatesMensagem,
    notificarCliente,
    atualizarCliente,
    removerCliente,
  } = useApp();

  const [aba, setAba] = useState<Aba>("processos");
  const [editando, setEditando] = useState(false);

  const cliente = clientePorId(id);
  const processos = useMemo(
    () => (cliente ? processosDoCliente(cliente.id) : []),
    [cliente, processosDoCliente],
  );
  const mensagens = useMemo(
    () => (cliente ? mensagensDoCliente(cliente.id) : []),
    [cliente, mensagensDoCliente],
  );
  const documentos = useMemo(
    () => (cliente ? documentosDoCliente(cliente.id) : []),
    [cliente, documentosDoCliente],
  );

  if (!cliente) {
    return (
      <div className="space-y-6">
        <Link
          to="/app/clientes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Voltar para clientes
        </Link>
        <EmptyState
          icon={<UserRound className="size-8" strokeWidth={1.2} />}
          title="Cliente não encontrado"
          description="Ele pode ter sido removido ou o endereço está incorreto."
        />
      </div>
    );
  }

  const prazoMaisProximo = [...processos]
    .filter((p) => p.prazoData)
    .sort((a, b) => +new Date(a.prazoData) - +new Date(b.prazoData))[0];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          to="/app/clientes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Voltar para clientes
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar nome={cliente.nome} className="size-14 text-2xl" />
            <div className="min-w-0">
              <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{cliente.nome}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="neutro">
                  {cliente.tipo === "juridica" ? "Pessoa jurídica" : "Pessoa física"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Cliente desde {formatDate(cliente.desde)}
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => setEditando(true)}>
            Editar cadastro
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Processos ativos
          </p>
          <p className="mt-3 font-serif text-4xl text-card-foreground">{processos.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Prazo mais próximo
          </p>
          {prazoMaisProximo ? (
            <>
              <p className="mt-3 font-serif text-2xl text-card-foreground">
                {formatDate(prazoMaisProximo.prazoData)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {prazoUtilRelativo(prazoMaisProximo.prazoData)}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Nenhum prazo em aberto</p>
          )}
        </Card>
        <Card className="p-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Mensagens enviadas
          </p>
          <p className="mt-3 font-serif text-4xl text-card-foreground">{mensagens.length}</p>
        </Card>
      </div>

      <Tabs
        value={aba}
        onChange={setAba}
        options={[
          { value: "processos", label: "Processos", badge: processos.length },
          { value: "comunicacao", label: "Comunicação", badge: mensagens.length },
          { value: "documentos", label: "Documentos", badge: documentos.length },
          { value: "dados", label: "Dados cadastrais" },
        ]}
      />

      {aba === "processos" &&
        (processos.length === 0 ? (
          <EmptyState
            icon={<Gavel className="size-8" strokeWidth={1.2} />}
            title="Nenhum processo vinculado"
            description="Cadastre um processo e vincule este cliente para vê-lo aqui."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {processos.map((p) => (
              <Link key={p.id} to="/app/processos/$id" params={{ id: p.id }} className="group">
                <Card className="h-full p-6 transition-transform group-hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-card-foreground">{p.tipoAcao}</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{p.numero}</p>
                    </div>
                    <StatusBadge status={prazoStatus(p.prazoData)} />
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    <p>
                      {p.vara} — {p.comarca}
                    </p>
                    <p>{p.statusAtual}</p>
                    <p>
                      Prazo: {formatDate(p.prazoData)} ({prazoUtilRelativo(p.prazoData)})
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ))}

      {aba === "comunicacao" && (
        <Comunicacao
          mensagens={mensagens}
          templates={templatesMensagem}
          clienteNome={cliente.nome}
          processos={processos}
          onEnviar={notificarCliente}
        />
      )}

      {aba === "documentos" &&
        (documentos.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-8" strokeWidth={1.2} />}
            title="Nenhum documento deste cliente"
            description="Documentos anexados aos processos deste cliente aparecem aqui."
          />
        ) : (
          <Card className="divide-y divide-border">
            {documentos.map((doc) => (
              <div key={doc.id} className="flex items-start gap-4 px-6 py-4">
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <FileText className="size-4.5" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{doc.nome}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {categoriaDocumentoLabel[doc.categoria]} · {formatBytes(doc.tamanhoBytes)} ·{" "}
                    {formatDate(doc.data)}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        ))}

      {aba === "dados" && (
        <Card className="p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <Dado label={cliente.tipo === "juridica" ? "CNPJ" : "CPF"}>
              {cliente.documento || "Não informado"}
            </Dado>
            <Dado label="Telefone">
              <span className="inline-flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" strokeWidth={1.5} />
                {cliente.telefone || "Não informado"}
              </span>
            </Dado>
            <Dado label="E-mail">
              <span className="inline-flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" strokeWidth={1.5} />
                {cliente.email || "Não informado"}
              </span>
            </Dado>
            <Dado label="Cliente desde">{formatDate(cliente.desde)}</Dado>
            <div className="sm:col-span-2">
              <Dado label="Endereço">
                <span className="inline-flex items-start gap-2">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  {cliente.endereco || "Não informado"}
                </span>
              </Dado>
            </div>
            {cliente.observacoes && (
              <div className="sm:col-span-2">
                <Dado label="Observações">{cliente.observacoes}</Dado>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                removerCliente(cliente.id);
                void navigate({ to: "/app/clientes" });
              }}
            >
              <Trash2 className="size-4" strokeWidth={1.5} />
              Remover cliente
            </Button>
            {processos.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Os {processos.length} processos vinculados continuarão na carteira.
              </p>
            )}
          </div>
        </Card>
      )}

      <EditarClienteModal
        aberto={editando}
        cliente={cliente}
        onFechar={() => setEditando(false)}
        onSalvar={(dados) => {
          atualizarCliente(cliente.id, dados);
          setEditando(false);
        }}
      />
    </div>
  );
}

function Comunicacao({
  mensagens,
  templates,
  clienteNome,
  processos,
  onEnviar,
}: {
  mensagens: ReturnType<typeof useApp>["mensagens"];
  templates: ReturnType<typeof useApp>["templatesMensagem"];
  clienteNome: string;
  processos: ReturnType<typeof useApp>["processos"];
  onEnviar: (processoId: string, texto: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [processoId, setProcessoId] = useState(processos[0]?.id ?? "");

  const processo = processos.find((p) => p.id === processoId);

  function aplicar(id: string) {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setTexto(
      tpl.texto
        .replaceAll("{{cliente}}", clienteNome.split(" ")[0] ?? clienteNome)
        .replaceAll("{{processo}}", processo?.numero ?? "")
        .replaceAll("{{prazo}}", processo ? formatDate(processo.prazoData) : ""),
    );
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim() || !processoId) return;
    onEnviar(processoId, texto.trim());
    setTexto("");
  }

  return (
    <div className="space-y-5">
      {processos.length === 0 ? (
        <Aviso tone="neutro">
          Vincule ao menos um processo a este cliente para registrar comunicações.
        </Aviso>
      ) : (
        <Card className="p-6">
          <h3 className="font-serif text-lg text-card-foreground">Nova mensagem</h3>
          <div className="mt-4">
            <Field label="Processo relacionado">
              <Select
                value={processoId}
                onChange={setProcessoId}
                options={processos.map((p) => ({
                  value: p.id,
                  label: `${p.tipoAcao} — ${p.numero}`,
                }))}
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => aplicar(t.id)}
                className="rounded-full border border-border bg-background px-3.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {t.nome}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} className="mt-4 space-y-3">
            <Textarea
              value={texto}
              onChange={setTexto}
              rows={4}
              placeholder="Escreva a mensagem..."
            />
            <div className="flex justify-end">
              <Button type="submit" variant="accent" disabled={!texto.trim()}>
                <Send className="size-4" strokeWidth={1.5} />
                Enviar por WhatsApp
              </Button>
            </div>
          </form>
        </Card>
      )}

      {mensagens.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="size-8" strokeWidth={1.2} />}
          title="Nenhuma mensagem trocada"
          description="O histórico de comunicação com este cliente aparece aqui."
        />
      ) : (
        <Card className="divide-y divide-border">
          {mensagens.map((m) => (
            <div key={m.id} className="px-6 py-5">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4 shrink-0 text-accent" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">{formatDateTime(m.data)}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{m.texto}</p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function EditarClienteModal({
  aberto,
  cliente,
  onFechar,
  onSalvar,
}: {
  aberto: boolean;
  cliente: ReturnType<typeof useApp>["clientes"][number];
  onFechar: () => void;
  onSalvar: (dados: Partial<ReturnType<typeof useApp>["clientes"][number]>) => void;
}) {
  const [nome, setNome] = useState(cliente.nome);
  const [telefone, setTelefone] = useState(cliente.telefone);
  const [email, setEmail] = useState(cliente.email);
  const [documento, setDocumento] = useState(cliente.documento);
  const [endereco, setEndereco] = useState(cliente.endereco ?? "");
  const [observacoes, setObservacoes] = useState(cliente.observacoes ?? "");
  const [tipo, setTipo] = useState<"fisica" | "juridica">(cliente.tipo);

  function salvar(e: FormEvent) {
    e.preventDefault();
    onSalvar({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      documento: documento.trim(),
      endereco: endereco.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
      tipo,
    });
  }

  return (
    <Modal open={aberto} onClose={onFechar} title="Editar cadastro" wide>
      <form onSubmit={salvar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome">
              <Input value={nome} onChange={setNome} required />
            </Field>
          </div>
          <Field label="Tipo">
            <Select
              value={tipo}
              onChange={setTipo}
              options={[
                { value: "fisica", label: "Pessoa física" },
                { value: "juridica", label: "Pessoa jurídica" },
              ]}
            />
          </Field>
          <Field label={tipo === "juridica" ? "CNPJ" : "CPF"}>
            <Input value={documento} onChange={setDocumento} />
          </Field>
          <Field label="Telefone">
            <Input value={telefone} onChange={setTelefone} placeholder="(00) 00000-0000" />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={email} onChange={setEmail} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Endereço">
              <Input value={endereco} onChange={setEndereco} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Observações">
              <Textarea value={observacoes} onChange={setObservacoes} rows={3} />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent">
            Salvar alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
