import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  CloudDownload,
  FileText,
  Gavel,
  Lock,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  SquareCheckBig,
  Trash2,
  Video,
} from "lucide-react";
import { useApp } from "@/lib/app-store";
import {
  Aviso,
  Badge,
  Button,
  Card,
  Dado,
  EmptyState,
  Field,
  Input,
  Modal,
  Progress,
  Select,
  StatusBadge,
  Tabs,
  Tag,
  Textarea,
} from "@/components/app/ui";
import {
  categoriaDocumentoLabel,
  faseLabel,
  formatBytes,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  modalidadeAudienciaLabel,
  prazoRelativo,
  prazoStatus,
  prioridadeLabel,
  statusAudienciaLabel,
  tipoAudienciaLabel,
} from "@/lib/format";
import { prazoUtilRelativo } from "@/lib/prazo";
import { consultarProcessoPje } from "@/lib/pje/consulta";
import type { CategoriaDocumento, PrioridadeTarefa } from "@/lib/mock-data";
import type { FontePje } from "@/lib/pje/types";

export const Route = createFileRoute("/app/processos/$id")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: ProcessoDetalhePage,
});

type Aba = "andamentos" | "checklist" | "documentos" | "audiencias" | "tarefas" | "comunicacao";

function ProcessoDetalhePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    processoPorId,
    clientePorId,
    documentosDoProcesso,
    tarefasDoProcesso,
    audienciasDoProcesso,
    mensagens,
    templates,
    templatesMensagem,
    alternarItemChecklist,
    adicionarItemChecklist,
    removerItemChecklist,
    aplicarTemplate,
    notificarCliente,
    sincronizarComPje,
    adicionarDocumento,
    removerDocumento,
    criarTarefa,
    atualizarTarefa,
    criarAudiencia,
    removerProcesso,
  } = useApp();

  const [aba, setAba] = useState<Aba>("andamentos");
  const [sincronizando, setSincronizando] = useState(false);
  const [resultadoSync, setResultadoSync] = useState<
    { ok: true; novos: number; fonte: FontePje } | { ok: false; erro: string } | null
  >(null);

  const processo = processoPorId(id);
  const cliente = processo ? clientePorId(processo.clienteId) : undefined;

  const documentos = useMemo(
    () => (processo ? documentosDoProcesso(processo.id) : []),
    [processo, documentosDoProcesso],
  );
  const tarefas = useMemo(
    () => (processo ? tarefasDoProcesso(processo.id) : []),
    [processo, tarefasDoProcesso],
  );
  const audiencias = useMemo(
    () => (processo ? audienciasDoProcesso(processo.id) : []),
    [processo, audienciasDoProcesso],
  );
  const conversas = useMemo(
    () =>
      processo
        ? mensagens
            .filter((m) => m.processoId === processo.id)
            .sort((a, b) => +new Date(b.data) - +new Date(a.data))
        : [],
    [processo, mensagens],
  );

  if (!processo) {
    return (
      <div className="space-y-6">
        <Link
          to="/app/processos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Voltar para processos
        </Link>
        <EmptyState
          icon={<Gavel className="size-8" strokeWidth={1.2} />}
          title="Processo não encontrado"
          description="Ele pode ter sido removido da carteira ou o endereço está incorreto."
        />
      </div>
    );
  }

  const concluidos = processo.checklist.filter((i) => i.concluido).length;

  async function sincronizar() {
    if (!processo) return;
    setSincronizando(true);
    setResultadoSync(null);
    try {
      const resposta = await consultarProcessoPje({
        data: { numero: processo.numero, tribunal: processo.tribunal },
      });
      if (!resposta.sucesso) {
        setResultadoSync({ ok: false, erro: resposta.erro });
        return;
      }
      const novos = sincronizarComPje(processo.id, resposta.processo);
      setResultadoSync({ ok: true, novos, fonte: resposta.fonte });
    } catch (erro) {
      setResultadoSync({
        ok: false,
        erro: erro instanceof Error ? erro.message : "Falha inesperada na consulta.",
      });
    } finally {
      setSincronizando(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          to="/app/processos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Voltar para processos
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={processo.origem === "pje" ? "primario" : "neutro"}>
                {processo.origem === "pje" ? "Importado do PJe" : "Cadastro manual"}
              </Badge>
              <Badge tone="neutro">{faseLabel[processo.fase]}</Badge>
              {processo.segredoJustica && (
                <Badge tone="perigo">
                  <Lock className="size-3" strokeWidth={2} />
                  Segredo de justiça
                </Badge>
              )}
            </div>
            <h1 className="mt-3 font-serif text-2xl text-foreground sm:text-3xl">
              {processo.tipoAcao}
            </h1>
            <p className="mt-1.5 font-mono text-sm text-muted-foreground">{processo.numero}</p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={sincronizar} disabled={sincronizando}>
              <RefreshCw
                className={`size-4 ${sincronizando ? "animate-spin" : ""}`}
                strokeWidth={1.5}
              />
              {sincronizando ? "Consultando..." : "Sincronizar PJe"}
            </Button>
          </div>
        </div>
      </div>

      {resultadoSync && (
        <Aviso
          tone={resultadoSync.ok ? (resultadoSync.novos > 0 ? "sucesso" : "neutro") : "perigo"}
          icon={<CloudDownload className="size-5" strokeWidth={1.5} />}
        >
          {resultadoSync.ok ? (
            <>
              {resultadoSync.novos > 0
                ? `${resultadoSync.novos} ${resultadoSync.novos === 1 ? "novo andamento importado" : "novos andamentos importados"}.`
                : "Nenhum andamento novo — o processo já estava atualizado."}{" "}
              <span className="text-muted-foreground">
                {resultadoSync.fonte === "simulador"
                  ? "Consulta feita no simulador (sem credenciais do MNI configuradas)."
                  : "Consulta feita no serviço MNI do tribunal."}
              </span>
            </>
          ) : (
            <>
              <strong className="font-medium">Não foi possível sincronizar.</strong>{" "}
              {resultadoSync.erro}
            </>
          )}
        </Aviso>
      )}

      <Card className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Dado label="Cliente">
            <Link
              to="/app/clientes/$id"
              params={{ id: processo.clienteId }}
              className="font-medium underline-offset-4 hover:underline"
            >
              {cliente?.nome ?? "—"}
            </Link>
          </Dado>
          <Dado label="Parte contrária">{processo.parteContraria}</Dado>
          <Dado label="Vara / Comarca">
            {processo.vara}
            <span className="block text-muted-foreground">{processo.comarca}</span>
          </Dado>
          <Dado label="Tribunal">{processo.tribunal}</Dado>
          <Dado label="Status atual">{processo.statusAtual}</Dado>
          <Dado label="Valor da causa">
            {processo.valorCausa ? formatCurrency(processo.valorCausa) : "Não informado"}
          </Dado>
          <Dado label="Última movimentação">{formatDate(processo.ultimaMovimentacao)}</Dado>
          <Dado label="Sincronizado com o PJe">
            {processo.sincronizadoEm ? formatDateTime(processo.sincronizadoEm) : "Nunca"}
          </Dado>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Próximo prazo — {processo.prazoTipo}
            </p>
            <p className="mt-2 font-serif text-2xl text-card-foreground">
              {formatDate(processo.prazoData)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {prazoUtilRelativo(processo.prazoData)}{" "}
              <span className="text-muted-foreground/70">
                ({prazoRelativo(processo.prazoData)} em dias corridos)
              </span>
            </p>
          </div>
          <StatusBadge status={prazoStatus(processo.prazoData)} />
        </div>
      </Card>

      <Tabs
        value={aba}
        onChange={setAba}
        options={[
          { value: "andamentos", label: "Andamentos", badge: processo.andamentos.length },
          { value: "checklist", label: "Check-list", badge: processo.checklist.length },
          { value: "documentos", label: "Documentos", badge: documentos.length },
          { value: "audiencias", label: "Audiências", badge: audiencias.length },
          { value: "tarefas", label: "Tarefas", badge: tarefas.length },
          { value: "comunicacao", label: "Comunicação", badge: conversas.length },
        ]}
      />

      {aba === "andamentos" && <AbaAndamentos processo={processo} />}

      {aba === "checklist" && (
        <AbaChecklist
          processoId={processo.id}
          checklist={processo.checklist}
          concluidos={concluidos}
          templates={templates}
          onAlternar={alternarItemChecklist}
          onAdicionar={adicionarItemChecklist}
          onRemover={removerItemChecklist}
          onAplicarTemplate={aplicarTemplate}
        />
      )}

      {aba === "documentos" && (
        <AbaDocumentos
          documentos={documentos}
          processoId={processo.id}
          clienteId={processo.clienteId}
          onAdicionar={adicionarDocumento}
          onRemover={removerDocumento}
        />
      )}

      {aba === "audiencias" && (
        <AbaAudiencias audiencias={audiencias} processoId={processo.id} onCriar={criarAudiencia} />
      )}

      {aba === "tarefas" && (
        <AbaTarefas
          tarefas={tarefas}
          processoId={processo.id}
          onCriar={criarTarefa}
          onAtualizar={atualizarTarefa}
        />
      )}

      {aba === "comunicacao" && (
        <AbaComunicacao
          conversas={conversas}
          templates={templatesMensagem}
          clienteNome={cliente?.nome ?? "cliente"}
          numeroProcesso={processo.numero}
          prazoData={processo.prazoData}
          onEnviar={(texto) => notificarCliente(processo.id, texto)}
        />
      )}

      <div className="border-t border-border pt-6">
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            removerProcesso(processo.id);
            void navigate({ to: "/app/processos" });
          }}
        >
          <Trash2 className="size-4" strokeWidth={1.5} />
          Remover processo da carteira
        </Button>
      </div>
    </div>
  );
}

function AbaAndamentos({ processo }: { processo: ReturnType<typeof useApp>["processos"][number] }) {
  if (processo.andamentos.length === 0) {
    return (
      <EmptyState
        icon={<Gavel className="size-8" strokeWidth={1.2} />}
        title="Nenhum andamento registrado"
        description="Sincronize com o PJe para importar a movimentação processual."
      />
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <ol className="relative space-y-7 border-l border-border pl-7">
        {processo.andamentos.map((a) => (
          <li key={a.id} className="relative">
            <span className="absolute top-1 -left-[2.19rem] grid size-4 place-items-center rounded-full border-2 border-background bg-accent" />
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{a.titulo}</p>
              {a.origem === "pje" && <Tag>PJe</Tag>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(a.data)}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.descricao}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function AbaChecklist({
  processoId,
  checklist,
  concluidos,
  templates,
  onAlternar,
  onAdicionar,
  onRemover,
  onAplicarTemplate,
}: {
  processoId: string;
  checklist: ReturnType<typeof useApp>["processos"][number]["checklist"];
  concluidos: number;
  templates: ReturnType<typeof useApp>["templates"];
  onAlternar: (processoId: string, itemId: string) => void;
  onAdicionar: (processoId: string, titulo: string, prazo?: string) => void;
  onRemover: (processoId: string, itemId: string) => void;
  onAplicarTemplate: (processoId: string, templateId: string) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [prazo, setPrazo] = useState("");
  const [templateId, setTemplateId] = useState("");

  function adicionar(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    onAdicionar(processoId, titulo.trim(), prazo || undefined);
    setTitulo("");
    setPrazo("");
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {concluidos} de {checklist.length} etapas concluídas
          </p>
        </div>
        <div className="mt-3">
          <Progress valor={concluidos} total={checklist.length} />
        </div>
      </Card>

      <Card className="divide-y divide-border">
        {checklist.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            Nenhuma etapa ainda. Adicione manualmente ou aplique um modelo.
          </p>
        ) : (
          checklist.map((item) => (
            <div key={item.id} className="flex items-start gap-3 px-6 py-4">
              <button
                onClick={() => onAlternar(processoId, item.id)}
                className="mt-0.5 shrink-0 text-accent"
                aria-label={item.concluido ? "Marcar como pendente" : "Marcar como concluído"}
              >
                {item.concluido ? (
                  <CheckCircle2 className="size-5" strokeWidth={1.5} />
                ) : (
                  <Circle className="size-5 text-muted-foreground" strokeWidth={1.5} />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={
                    item.concluido
                      ? "text-sm text-muted-foreground line-through"
                      : "text-sm text-foreground"
                  }
                >
                  {item.titulo}
                </p>
                {item.prazo && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Prazo: {formatDate(item.prazo)} — {prazoUtilRelativo(item.prazo)}
                  </p>
                )}
              </div>
              <button
                onClick={() => onRemover(processoId, item.id)}
                className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Remover etapa"
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          ))
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-serif text-lg text-card-foreground">Adicionar etapa</h3>
        <form
          onSubmit={adicionar}
          className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_auto]"
        >
          <Input value={titulo} onChange={setTitulo} placeholder="O que precisa ser feito?" />
          <Input type="date" value={prazo} onChange={setPrazo} />
          <Button type="submit" variant="primary">
            <Plus className="size-4" strokeWidth={2} />
            Adicionar
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Aplicar modelo de check-list
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Select
              value={templateId}
              onChange={setTemplateId}
              placeholder="Escolha um modelo..."
              options={templates.map((t) => ({ value: t.id, label: t.nome }))}
            />
            <Button
              variant="outline"
              disabled={!templateId}
              onClick={() => {
                onAplicarTemplate(processoId, templateId);
                setTemplateId("");
              }}
            >
              Aplicar modelo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

const categoriasDoc: CategoriaDocumento[] = [
  "peticao",
  "decisao",
  "contrato",
  "procuracao",
  "documento-pessoal",
  "prova",
  "comprovante",
  "outro",
];

function AbaDocumentos({
  documentos,
  processoId,
  clienteId,
  onAdicionar,
  onRemover,
}: {
  documentos: ReturnType<typeof useApp>["documentos"];
  processoId: string;
  clienteId: string;
  onAdicionar: ReturnType<typeof useApp>["adicionarDocumento"];
  onRemover: (id: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDocumento>("peticao");
  const [descricao, setDescricao] = useState("");

  function salvar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    const extensao = nome.includes(".") ? nome.split(".").pop()!.toLowerCase() : "pdf";
    onAdicionar({
      nome: nome.trim(),
      categoria,
      processoId,
      clienteId,
      data: new Date().toISOString(),
      tamanhoBytes: 120_000 + Math.floor(Math.random() * 800_000),
      extensao,
      descricao: descricao.trim() || undefined,
      tags: [],
    });
    setNome("");
    setDescricao("");
    setCategoria("peticao");
    setAberto(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setAberto(true)}>
          <Plus className="size-4" strokeWidth={2} />
          Anexar documento
        </Button>
      </div>

      {documentos.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-8" strokeWidth={1.2} />}
          title="Nenhum documento neste processo"
          description="Centralize aqui petições, decisões, procurações e provas."
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
                {doc.descricao && (
                  <p className="mt-2 text-sm text-muted-foreground">{doc.descricao}</p>
                )}
              </div>
              <button
                onClick={() => onRemover(doc.id)}
                className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Remover documento"
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </Card>
      )}

      <Modal open={aberto} onClose={() => setAberto(false)} title="Anexar documento">
        <form onSubmit={salvar} className="space-y-4">
          <Field label="Nome do arquivo">
            <Input
              value={nome}
              onChange={setNome}
              placeholder="Ex.: Réplica à contestação.pdf"
              required
            />
          </Field>
          <Field label="Categoria">
            <Select
              value={categoria}
              onChange={setCategoria}
              options={categoriasDoc.map((c) => ({ value: c, label: categoriaDocumentoLabel[c] }))}
            />
          </Field>
          <Field label="Descrição (opcional)">
            <Textarea
              value={descricao}
              onChange={setDescricao}
              rows={3}
              placeholder="Um resumo do conteúdo, para achar depois."
            />
          </Field>
          <Aviso tone="neutro">
            Protótipo sem armazenamento: o arquivo em si não é enviado, apenas o registro do
            documento é criado.
          </Aviso>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent">
              Anexar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function AbaAudiencias({
  audiencias,
  processoId,
  onCriar,
}: {
  audiencias: ReturnType<typeof useApp>["audiencias"];
  processoId: string;
  onCriar: ReturnType<typeof useApp>["criarAudiencia"];
}) {
  const [aberto, setAberto] = useState(false);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("14:00");
  const [tipo, setTipo] = useState<
    "conciliacao" | "instrucao" | "una" | "julgamento" | "justificacao" | "outra"
  >("conciliacao");
  const [modalidade, setModalidade] = useState<"presencial" | "virtual" | "hibrida">("presencial");
  const [local, setLocal] = useState("");
  const [link, setLink] = useState("");

  function salvar(e: FormEvent) {
    e.preventDefault();
    if (!data || !local.trim()) return;
    onCriar({
      processoId,
      tipo,
      data: new Date(`${data}T${hora || "12:00"}:00`).toISOString(),
      local: local.trim(),
      modalidade,
      link: link.trim() || undefined,
      status: "agendada",
    });
    setData("");
    setLocal("");
    setLink("");
    setAberto(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setAberto(true)}>
          <Plus className="size-4" strokeWidth={2} />
          Designar audiência
        </Button>
      </div>

      {audiencias.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-8" strokeWidth={1.2} />}
          title="Nenhuma audiência designada"
          description="Registre aqui as audiências para que apareçam na sua agenda."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {audiencias.map((a) => (
            <Card key={a.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-card-foreground">{tipoAudienciaLabel[a.tipo]}</p>
                  <p className="mt-1 font-serif text-xl text-card-foreground">
                    {formatDate(a.data)} · {formatTime(a.data)}
                  </p>
                </div>
                <Badge
                  tone={
                    a.status === "realizada"
                      ? "sucesso"
                      : a.status === "cancelada"
                        ? "perigo"
                        : "destaque"
                  }
                >
                  {statusAudienciaLabel[a.status]}
                </Badge>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{a.local}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Tag>{modalidadeAudienciaLabel[a.modalidade]}</Tag>
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-accent-foreground underline underline-offset-4"
                  >
                    <Video className="size-3.5" strokeWidth={1.5} />
                    Sala virtual
                  </a>
                )}
              </div>
              {a.observacoes && (
                <p className="mt-4 text-sm text-muted-foreground">{a.observacoes}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={aberto} onClose={() => setAberto(false)} title="Designar audiência">
        <form onSubmit={salvar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data">
              <Input type="date" value={data} onChange={setData} required />
            </Field>
            <Field label="Horário">
              <Input type="time" value={hora} onChange={setHora} required />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo">
              <Select
                value={tipo}
                onChange={setTipo}
                options={[
                  { value: "conciliacao", label: "Conciliação" },
                  { value: "instrucao", label: "Instrução" },
                  { value: "una", label: "Audiência una" },
                  { value: "julgamento", label: "Julgamento" },
                  { value: "justificacao", label: "Justificação" },
                  { value: "outra", label: "Outra" },
                ]}
              />
            </Field>
            <Field label="Modalidade">
              <Select
                value={modalidade}
                onChange={setModalidade}
                options={[
                  { value: "presencial", label: "Presencial" },
                  { value: "virtual", label: "Virtual" },
                  { value: "hibrida", label: "Híbrida" },
                ]}
              />
            </Field>
          </div>
          <Field label="Local">
            <Input
              value={local}
              onChange={setLocal}
              placeholder="Ex.: 3ª Vara Cível — Fórum Rodolfo Aureliano"
              required
            />
          </Field>
          {modalidade !== "presencial" && (
            <Field label="Link da sala virtual (opcional)">
              <Input value={link} onChange={setLink} placeholder="https://..." />
            </Field>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent">
              Designar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function AbaTarefas({
  tarefas,
  processoId,
  onCriar,
  onAtualizar,
}: {
  tarefas: ReturnType<typeof useApp>["tarefas"];
  processoId: string;
  onCriar: ReturnType<typeof useApp>["criarTarefa"];
  onAtualizar: ReturnType<typeof useApp>["atualizarTarefa"];
}) {
  const [titulo, setTitulo] = useState("");
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>("media");
  const [prazo, setPrazo] = useState("");

  function adicionar(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    onCriar({
      titulo: titulo.trim(),
      processoId,
      prioridade,
      status: "pendente",
      prazo: prazo ? new Date(`${prazo}T12:00:00`).toISOString() : undefined,
    });
    setTitulo("");
    setPrazo("");
    setPrioridade("media");
  }

  return (
    <div className="space-y-5">
      {tarefas.length === 0 ? (
        <EmptyState
          icon={<SquareCheckBig className="size-8" strokeWidth={1.2} />}
          title="Nenhuma tarefa neste processo"
          description="Quebre o trabalho em tarefas para não perder nada de vista."
        />
      ) : (
        <Card className="divide-y divide-border">
          {tarefas.map((t) => (
            <div key={t.id} className="flex items-start gap-3 px-6 py-4">
              <button
                onClick={() =>
                  onAtualizar(t.id, {
                    status: t.status === "concluida" ? "pendente" : "concluida",
                  })
                }
                className="mt-0.5 shrink-0 text-accent"
                aria-label="Alternar conclusão"
              >
                {t.status === "concluida" ? (
                  <CheckCircle2 className="size-5" strokeWidth={1.5} />
                ) : (
                  <Circle className="size-5 text-muted-foreground" strokeWidth={1.5} />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={
                    t.status === "concluida"
                      ? "text-sm text-muted-foreground line-through"
                      : "text-sm text-foreground"
                  }
                >
                  {t.titulo}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Badge
                    tone={
                      t.prioridade === "alta"
                        ? "perigo"
                        : t.prioridade === "media"
                          ? "destaque"
                          : "neutro"
                    }
                  >
                    {prioridadeLabel[t.prioridade]}
                  </Badge>
                  {t.prazo && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(t.prazo)} — {prazoUtilRelativo(t.prazo)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-serif text-lg text-card-foreground">Nova tarefa</h3>
        <form
          onSubmit={adicionar}
          className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_11rem_auto]"
        >
          <Input value={titulo} onChange={setTitulo} placeholder="O que precisa ser feito?" />
          <Select
            value={prioridade}
            onChange={setPrioridade}
            options={[
              { value: "alta", label: "Alta" },
              { value: "media", label: "Média" },
              { value: "baixa", label: "Baixa" },
            ]}
          />
          <Input type="date" value={prazo} onChange={setPrazo} />
          <Button type="submit">
            <Plus className="size-4" strokeWidth={2} />
            Criar
          </Button>
        </form>
      </Card>
    </div>
  );
}

function AbaComunicacao({
  conversas,
  templates,
  clienteNome,
  numeroProcesso,
  prazoData,
  onEnviar,
}: {
  conversas: ReturnType<typeof useApp>["mensagens"];
  templates: ReturnType<typeof useApp>["templatesMensagem"];
  clienteNome: string;
  numeroProcesso: string;
  prazoData: string;
  onEnviar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState("");

  function aplicarTemplate(id: string) {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setTexto(
      tpl.texto
        .replaceAll("{{cliente}}", clienteNome.split(" ")[0] ?? clienteNome)
        .replaceAll("{{processo}}", numeroProcesso)
        .replaceAll("{{prazo}}", formatDate(prazoData)),
    );
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    onEnviar(texto.trim());
    setTexto("");
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h3 className="font-serif text-lg text-card-foreground">Enviar atualização ao cliente</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Mensagem enviada por WhatsApp para {clienteNome}.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => aplicarTemplate(t.id)}
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
            placeholder="Escreva a atualização ou escolha um modelo acima..."
          />
          <div className="flex justify-end">
            <Button type="submit" variant="accent" disabled={!texto.trim()}>
              <Send className="size-4" strokeWidth={1.5} />
              Enviar por WhatsApp
            </Button>
          </div>
        </form>
      </Card>

      {conversas.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="size-8" strokeWidth={1.2} />}
          title="Nenhuma mensagem enviada"
          description="O histórico de comunicação com o cliente aparece aqui."
        />
      ) : (
        <Card className="divide-y divide-border">
          {conversas.map((m) => (
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
