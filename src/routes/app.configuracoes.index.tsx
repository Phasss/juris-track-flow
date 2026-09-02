import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  CheckCircle2,
  Info,
  MessageSquare,
  Plug,
  Plus,
  Trash2,
} from "lucide-react";
import { useApp } from "@/lib/app-store";
import {
  Aviso,
  Badge,
  Button,
  Card,
  Checkbox,
  Dado,
  Field,
  Input,
  SectionTitle,
  Select,
  Tabs,
  Textarea,
} from "@/components/app/ui";
import { TRIBUNAIS, endpointMni } from "@/lib/pje/tribunais";
import { statusIntegracaoPje } from "@/lib/pje/consulta";
import type { StatusIntegracao } from "@/lib/pje/types";

export const Route = createFileRoute("/app/configuracoes/")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: ConfiguracoesPage,
});

type Aba = "escritorio" | "pje" | "notificacoes" | "mensagens";

function ConfiguracoesPage() {
  const [aba, setAba] = useState<Aba>("escritorio");

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Configurações"
        description="Dados do escritório, integração com o PJe e como você quer ser avisado."
      />

      <Tabs
        value={aba}
        onChange={setAba}
        options={[
          { value: "escritorio", label: "Escritório" },
          { value: "pje", label: "Integração PJe" },
          { value: "notificacoes", label: "Notificações" },
          { value: "mensagens", label: "Modelos de mensagem" },
        ]}
      />

      {aba === "escritorio" && <AbaEscritorio />}
      {aba === "pje" && <AbaPje />}
      {aba === "notificacoes" && <AbaNotificacoes />}
      {aba === "mensagens" && <AbaMensagens />}
    </div>
  );
}

function AbaEscritorio() {
  const { perfil, atualizarPerfil } = useApp();
  const [form, setForm] = useState(perfil);
  const [salvo, setSalvo] = useState(false);

  function salvar(e: FormEvent) {
    e.preventDefault();
    atualizarPerfil(form);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <Building2 className="size-4.5" strokeWidth={1.5} />
          </span>
          <h2 className="font-serif text-xl text-card-foreground">Dados do escritório</h2>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Nome do escritório">
            <Input
              value={form.escritorio}
              onChange={(v) => setForm({ ...form, escritorio: v })}
              required
            />
          </Field>
          <Field label="Advogado responsável">
            <Input
              value={form.responsavel}
              onChange={(v) => setForm({ ...form, responsavel: v })}
              required
            />
          </Field>
          <Field label="Inscrição na OAB">
            <Input value={form.oab} onChange={(v) => setForm({ ...form, oab: v })} />
          </Field>
          <Field label="Telefone">
            <Input value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="E-mail de contato">
              <Input
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {salvo && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="size-4" strokeWidth={1.5} />
              Alterações salvas
            </span>
          )}
          <Button type="submit" variant="accent">
            Salvar
          </Button>
        </div>
      </Card>
    </form>
  );
}

function AbaPje() {
  const [status, setStatus] = useState<StatusIntegracao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tribunalSelecionado, setTribunalSelecionado] = useState("TJPE");

  useEffect(() => {
    let ativo = true;
    statusIntegracaoPje()
      .then((s) => {
        if (ativo) setStatus(s);
      })
      .catch((e: unknown) => {
        if (ativo) setErro(e instanceof Error ? e.message : "Falha ao consultar o status.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const tribunal = TRIBUNAIS.find((t) => t.sigla === tribunalSelecionado);
  const endpoint = tribunal ? endpointMni(tribunal) : null;

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <Plug className="size-4.5" strokeWidth={1.5} />
            </span>
            <h2 className="font-serif text-xl text-card-foreground">Status da integração</h2>
          </div>
          {status && (
            <Badge tone={status.configurado ? "sucesso" : "destaque"}>
              {status.configurado ? "MNI ativo" : "Modo demonstração"}
            </Badge>
          )}
        </div>

        {carregando && <p className="mt-5 text-sm text-muted-foreground">Verificando...</p>}
        {erro && (
          <div className="mt-5">
            <Aviso tone="perigo" icon={<Info className="size-5" strokeWidth={1.5} />}>
              {erro}
            </Aviso>
          </div>
        )}
        {status && (
          <div className="mt-5 space-y-5">
            <p className="text-sm text-muted-foreground">{status.mensagem}</p>
            {status.endpoint && (
              <Dado label="Endpoint em uso">
                <span className="font-mono text-xs break-all">{status.endpoint}</span>
              </Dado>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-serif text-xl text-card-foreground">Como ativar o PJe de verdade</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A consulta ao PJe usa o <strong>MNI</strong> (Modelo Nacional de Interoperabilidade), o
          web service SOAP padronizado pelo CNJ. Ele exige credenciais de consultante emitidas pelo
          tribunal e roda exclusivamente no servidor — o navegador nunca vê a senha.
        </p>

        <ol className="mt-6 space-y-4">
          {[
            {
              titulo: "Solicite as credenciais ao tribunal",
              texto:
                "Cada tribunal libera o acesso automatizado ao MNI mediante cadastro. Geralmente é o CPF do advogado e uma senha específica de integração — em alguns tribunais, certificado ICP-Brasil.",
            },
            {
              titulo: "Confirme o endpoint do tribunal",
              texto:
                "O endereço do serviço varia. Confira na página de dados abertos ou de acesso automatizado por sistemas externos do tribunal.",
            },
            {
              titulo: "Defina as variáveis de ambiente no servidor",
              texto:
                "PJE_MNI_ENDPOINT, PJE_MNI_ID_CONSULTANTE e PJE_MNI_SENHA_CONSULTANTE. Assim que as três existirem, o sistema passa a consultar o tribunal automaticamente, sem mudar nada nas telas.",
            },
          ].map((passo, i) => (
            <li key={passo.titulo} className="flex gap-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-sm text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{passo.titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{passo.texto}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Variáveis de ambiente
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-primary p-4 font-mono text-xs leading-relaxed text-primary-foreground">
            {`PJE_MNI_ENDPOINT="https://pjemni.app.tjpe.jus.br/1g/servico-intercomunicacao-2.2.2"
PJE_MNI_ID_CONSULTANTE="00000000000"
PJE_MNI_SENHA_CONSULTANTE="sua-senha-de-integracao"`}
          </pre>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-serif text-xl text-card-foreground">Endpoints por tribunal</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Referência dos serviços MNI. Confirme sempre com o tribunal antes de usar em produção.
        </p>

        <div className="mt-5 max-w-sm">
          <Field label="Tribunal">
            <Select
              value={tribunalSelecionado}
              onChange={setTribunalSelecionado}
              options={TRIBUNAIS.map((t) => ({ value: t.sigla, label: `${t.sigla} — ${t.nome}` }))}
            />
          </Field>
        </div>

        {tribunal && (
          <div className="mt-5 space-y-4">
            <Dado label="Endpoint do 1º grau">
              {endpoint ? (
                <span className="font-mono text-xs break-all">{endpoint}</span>
              ) : (
                <span className="text-muted-foreground">
                  Não cadastrado — solicite ao tribunal o endereço do serviço MNI.
                </span>
              )}
            </Dado>
            {tribunal.confirmar && (
              <Aviso tone="destaque" icon={<Info className="size-5" strokeWidth={1.5} />}>
                Endpoint deste tribunal ainda não foi confirmado. Verifique na página de acesso
                automatizado do {tribunal.sigla} antes de configurar.
              </Aviso>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function AbaNotificacoes() {
  const { preferencias, atualizarPreferencias } = useApp();
  const [form, setForm] = useState(preferencias);
  const [salvo, setSalvo] = useState(false);

  function salvar(e: FormEvent) {
    e.preventDefault();
    atualizarPreferencias(form);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <form onSubmit={salvar}>
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <Bell className="size-4.5" strokeWidth={1.5} />
          </span>
          <h2 className="font-serif text-xl text-card-foreground">Alertas e comunicação</h2>
        </div>

        <div className="mt-6 max-w-xs">
          <Field label="Avisar quando o prazo estiver a">
            <Select
              value={String(form.alertaPrazoDias)}
              onChange={(v) => setForm({ ...form, alertaPrazoDias: Number(v) })}
              options={[
                { value: "3", label: "3 dias do vencimento" },
                { value: "5", label: "5 dias do vencimento" },
                { value: "7", label: "7 dias do vencimento" },
                { value: "15", label: "15 dias do vencimento" },
              ]}
            />
          </Field>
        </div>

        <div className="mt-6 space-y-4 border-t border-border pt-6">
          <Checkbox
            checked={form.contarPrazoEmDiasUteis}
            onChange={(v) => setForm({ ...form, contarPrazoEmDiasUteis: v })}
            label={
              <>
                <span className="font-medium">Contar prazos em dias úteis</span>
                <span className="mt-0.5 block text-muted-foreground">
                  Segue o CPC art. 219, pulando fins de semana, feriados forenses e o recesso de
                  20/12 a 20/01.
                </span>
              </>
            }
          />
          <Checkbox
            checked={form.notificarWhatsAppAutomatico}
            onChange={(v) => setForm({ ...form, notificarWhatsAppAutomatico: v })}
            label={
              <>
                <span className="font-medium">Avisar o cliente por WhatsApp automaticamente</span>
                <span className="mt-0.5 block text-muted-foreground">
                  Quando um novo andamento for importado do PJe.
                </span>
              </>
            }
          />
          <Checkbox
            checked={form.notificarEmailDiario}
            onChange={(v) => setForm({ ...form, notificarEmailDiario: v })}
            label={
              <>
                <span className="font-medium">Resumo diário por e-mail</span>
                <span className="mt-0.5 block text-muted-foreground">
                  Prazos do dia, audiências e tarefas atrasadas.
                </span>
              </>
            }
          />
          <Checkbox
            checked={form.sincronizacaoAutomaticaPje}
            onChange={(v) => setForm({ ...form, sincronizacaoAutomaticaPje: v })}
            label={
              <>
                <span className="font-medium">Sincronizar com o PJe automaticamente</span>
                <span className="mt-0.5 block text-muted-foreground">
                  Consulta diária de novos andamentos em toda a carteira.
                </span>
              </>
            }
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {salvo && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="size-4" strokeWidth={1.5} />
              Preferências salvas
            </span>
          )}
          <Button type="submit" variant="accent">
            Salvar
          </Button>
        </div>
      </Card>
    </form>
  );
}

function AbaMensagens() {
  const { templatesMensagem, criarTemplateMensagem, removerTemplateMensagem } = useApp();
  const [nome, setNome] = useState("");
  const [texto, setTexto] = useState("");

  function criar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !texto.trim()) return;
    criarTemplateMensagem({ nome: nome.trim(), texto: texto.trim() });
    setNome("");
    setTexto("");
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <MessageSquare className="size-4.5" strokeWidth={1.5} />
          </span>
          <h2 className="font-serif text-xl text-card-foreground">Modelos de mensagem</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Use <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{"{{cliente}}"}</code>,{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{"{{processo}}"}</code> e{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{"{{prazo}}"}</code> — eles
          são substituídos automaticamente ao enviar.
        </p>

        <div className="mt-6 space-y-3">
          {templatesMensagem.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-4 rounded-2xl border border-border bg-surface px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{t.nome}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.texto}</p>
              </div>
              <button
                onClick={() => removerTemplateMensagem(t.id)}
                className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Remover modelo"
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-serif text-lg text-card-foreground">Novo modelo</h2>
        <form onSubmit={criar} className="mt-5 space-y-4">
          <Field label="Nome do modelo">
            <Input value={nome} onChange={setNome} placeholder="Ex.: Aviso de audiência" required />
          </Field>
          <Field label="Texto da mensagem">
            <Textarea
              value={texto}
              onChange={setTexto}
              rows={4}
              placeholder="Olá, {{cliente}}! ..."
              required
            />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" variant="accent">
              <Plus className="size-4" strokeWidth={2} />
              Criar modelo
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
