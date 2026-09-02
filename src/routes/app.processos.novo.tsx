import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CloudDownload, Info, PencilLine, Search, Sparkles } from "lucide-react";
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
  Select,
  SectionTitle,
  Tabs,
  Textarea,
} from "@/components/app/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { calcularVencimento, prazosComuns } from "@/lib/prazo";
import { descreverNumero, mascararNumeroCnj, validarNumeroCnj } from "@/lib/pje/numero-cnj";
import { consultarProcessoPje } from "@/lib/pje/consulta";
import type { FaseProcesso } from "@/lib/mock-data";
import type { ProcessoPje } from "@/lib/pje/types";

export const Route = createFileRoute("/app/processos/novo")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: NovoProcessoPage,
});

type Modo = "pje" | "manual";

const fases: FaseProcesso[] = ["conhecimento", "instrucao", "recursal", "execucao", "arquivado"];

function NovoProcessoPage() {
  const [modo, setModo] = useState<Modo>("pje");

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
        <SectionTitle
          title="Novo processo"
          description="Importe direto do PJe pelo número ou cadastre manualmente os dados."
        />
      </div>

      <Tabs
        value={modo}
        onChange={setModo}
        options={[
          { value: "pje", label: "Importar do PJe" },
          { value: "manual", label: "Cadastro manual" },
        ]}
      />

      {modo === "pje" ? <ImportarDoPje /> : <CadastroManual />}
    </div>
  );
}

function ImportarDoPje() {
  const navigate = useNavigate();
  const { clientes, criarProcesso, criarCliente } = useApp();

  const [numero, setNumero] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ processo: ProcessoPje; fonte: string } | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [novoClienteNome, setNovoClienteNome] = useState("");

  const validacao = numero.trim() ? validarNumeroCnj(numero) : null;

  async function consultar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setResultado(null);

    const v = validarNumeroCnj(numero);
    if (!v.valido) {
      setErro(v.erro);
      return;
    }

    setConsultando(true);
    try {
      const resposta = await consultarProcessoPje({
        data: { numero: v.numero.formatado, tribunal: v.numero.sigla },
      });
      if (!resposta.sucesso) {
        setErro(resposta.erro);
        return;
      }
      setResultado({ processo: resposta.processo, fonte: resposta.fonte });
      // Sugere o polo ativo como nome do cliente, se ainda não houver correspondência.
      const ativo = resposta.processo.partes.find((p) => p.polo === "ativo");
      if (ativo) {
        const existente = clientes.find((c) => c.nome.toLowerCase() === ativo.nome.toLowerCase());
        if (existente) setClienteId(existente.id);
        else setNovoClienteNome(ativo.nome);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha inesperada ao consultar o PJe.");
    } finally {
      setConsultando(false);
    }
  }

  function importar() {
    if (!resultado) return;
    const p = resultado.processo;

    let idCliente = clienteId;
    if (!idCliente) {
      const nome = novoClienteNome.trim();
      if (!nome) {
        setErro("Escolha um cliente existente ou informe o nome para cadastrar.");
        return;
      }
      idCliente = criarCliente({
        nome,
        telefone: "",
        email: "",
        tipo: "fisica",
        documento: "",
        desde: new Date().toISOString(),
      });
    }

    const passivo = p.partes.find((x) => x.polo === "passivo");
    const maisRecente = p.movimentos[0];

    const id = criarProcesso({
      numero: p.numero,
      clienteId: idCliente,
      tipoAcao: p.classe,
      vara: p.orgaoJulgador,
      comarca: p.comarca,
      tribunal: p.tribunal,
      statusAtual: maisRecente?.titulo ?? "Aguardando movimentação",
      ultimaMovimentacao: maisRecente?.data ?? new Date().toISOString(),
      prazoTipo: "A definir",
      prazoData: calcularVencimento(new Date(), 15).toISOString(),
      origem: "pje",
      fase: "conhecimento",
      parteContraria: passivo?.nome ?? "Não informada",
      valorCausa: p.valorCausa,
      segredoJustica: p.segredoJustica,
      sincronizadoEm: new Date().toISOString(),
      andamentos: p.movimentos.map((m, i) => ({
        id: `imp-${i}-${Date.now()}`,
        data: m.data,
        titulo: m.titulo,
        descricao: m.descricao,
        origem: "pje" as const,
      })),
      checklist: [],
    });

    void navigate({ to: "/app/processos/$id", params: { id } });
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <form onSubmit={consultar} className="space-y-4">
          <Field label="Número único do processo (CNJ)">
            <Input
              value={numero}
              onChange={(v) => setNumero(mascararNumeroCnj(v))}
              placeholder="0000000-00.0000.0.00.0000"
            />
          </Field>

          {validacao && !validacao.valido && numero.replace(/\D/g, "").length === 20 && (
            <p className="text-sm text-destructive">{validacao.erro}</p>
          )}
          {validacao?.valido && (
            <p className="text-sm text-muted-foreground">
              <Sparkles className="mr-1.5 inline size-4 text-accent" strokeWidth={1.5} />
              {descreverNumero(validacao.numero)}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" variant="accent" disabled={consultando}>
              <Search className="size-4" strokeWidth={1.5} />
              {consultando ? "Consultando o tribunal..." : "Consultar processo"}
            </Button>
          </div>
        </form>
      </Card>

      {erro && (
        <Aviso tone="perigo" icon={<Info className="size-5" strokeWidth={1.5} />}>
          {erro}
        </Aviso>
      )}

      {resultado && (
        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-serif text-xl text-card-foreground">
                {resultado.processo.classe}
              </h2>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {resultado.processo.numero}
              </p>
            </div>
            <Badge tone={resultado.fonte === "mni" ? "sucesso" : "destaque"}>
              {resultado.fonte === "mni" ? "Dados do tribunal (MNI)" : "Dados simulados"}
            </Badge>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Dado label="Órgão julgador">{resultado.processo.orgaoJulgador}</Dado>
            <Dado label="Comarca">{resultado.processo.comarca}</Dado>
            <Dado label="Tribunal">{resultado.processo.tribunal}</Dado>
            <Dado label="Assunto">{resultado.processo.assunto ?? "Não informado"}</Dado>
            <Dado label="Valor da causa">
              {resultado.processo.valorCausa
                ? formatCurrency(resultado.processo.valorCausa)
                : "Não informado"}
            </Dado>
            <Dado label="Segredo de justiça">
              {resultado.processo.segredoJustica ? "Sim" : "Não"}
            </Dado>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Partes
            </p>
            <ul className="mt-3 space-y-2">
              {resultado.processo.partes.map((parte, i) => (
                <li key={`${parte.nome}-${i}`} className="flex items-center gap-3 text-sm">
                  <Badge tone={parte.polo === "ativo" ? "primario" : "neutro"}>
                    {parte.polo === "ativo" ? "Polo ativo" : "Polo passivo"}
                  </Badge>
                  <span className="min-w-0 truncate text-foreground">{parte.nome}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {resultado.processo.movimentos.length} movimentos serão importados
            </p>
            <ol className="mt-3 space-y-2">
              {resultado.processo.movimentos.slice(0, 4).map((m, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  <span className="text-foreground">{m.titulo}</span> — {formatDate(m.data)}
                </li>
              ))}
              {resultado.processo.movimentos.length > 4 && (
                <li className="text-sm text-muted-foreground">
                  e mais {resultado.processo.movimentos.length - 4}...
                </li>
              )}
            </ol>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <Field label="Vincular a um cliente">
              <Select
                value={clienteId}
                onChange={setClienteId}
                placeholder="Cadastrar novo cliente..."
                options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
              />
            </Field>
            {!clienteId && (
              <div className="mt-3">
                <Field label="Nome do novo cliente">
                  <Input
                    value={novoClienteNome}
                    onChange={setNovoClienteNome}
                    placeholder="Nome completo do cliente"
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="accent" onClick={importar}>
              <CloudDownload className="size-4" strokeWidth={1.5} />
              Importar para a carteira
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function CadastroManual() {
  const navigate = useNavigate();
  const { clientes, criarProcesso } = useApp();

  const [numero, setNumero] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [tipoAcao, setTipoAcao] = useState("");
  const [vara, setVara] = useState("");
  const [comarca, setComarca] = useState("");
  const [parteContraria, setParteContraria] = useState("");
  const [statusAtual, setStatusAtual] = useState("");
  const [valorCausa, setValorCausa] = useState("");
  const [fase, setFase] = useState<FaseProcesso>("conhecimento");
  const [segredo, setSegredo] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  const [prazoTipo, setPrazoTipo] = useState("");
  const [prazoData, setPrazoData] = useState("");
  const [intimacao, setIntimacao] = useState("");
  const [diasPrazo, setDiasPrazo] = useState("15");

  const [erro, setErro] = useState<string | null>(null);

  const validacao = numero.trim() ? validarNumeroCnj(numero) : null;
  const vencimentoCalculado =
    intimacao && Number(diasPrazo) > 0
      ? calcularVencimento(new Date(`${intimacao}T12:00:00`), Number(diasPrazo))
      : null;

  function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    const v = validarNumeroCnj(numero);
    if (!v.valido) {
      setErro(v.erro);
      return;
    }
    if (!clienteId) {
      setErro("Selecione o cliente vinculado ao processo.");
      return;
    }

    const dataPrazo = prazoData
      ? new Date(`${prazoData}T12:00:00`)
      : (vencimentoCalculado ?? calcularVencimento(new Date(), 15));

    const id = criarProcesso({
      numero: v.numero.formatado,
      clienteId,
      tipoAcao: tipoAcao.trim() || "Não informado",
      vara: vara.trim() || "Não informada",
      comarca: comarca.trim() || "Não informada",
      tribunal: v.numero.sigla,
      statusAtual: statusAtual.trim() || "Cadastrado manualmente",
      ultimaMovimentacao: new Date().toISOString(),
      prazoTipo: prazoTipo.trim() || "A definir",
      prazoData: dataPrazo.toISOString(),
      origem: "manual",
      fase,
      parteContraria: parteContraria.trim() || "Não informada",
      valorCausa: valorCausa ? Number(valorCausa.replace(/\./g, "").replace(",", ".")) : undefined,
      segredoJustica: segredo,
      observacoes: observacoes.trim() || undefined,
      andamentos: [],
      checklist: [],
    });

    void navigate({ to: "/app/processos/$id", params: { id } });
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <Card className="p-6 sm:p-8">
        <h2 className="font-serif text-lg text-card-foreground">Dados do processo</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Número único do processo (CNJ)">
              <Input
                value={numero}
                onChange={(v) => setNumero(mascararNumeroCnj(v))}
                placeholder="0000000-00.0000.0.00.0000"
                required
              />
            </Field>
            {validacao?.valido ? (
              <p className="mt-2 text-sm text-muted-foreground">
                <Sparkles className="mr-1.5 inline size-4 text-accent" strokeWidth={1.5} />
                {descreverNumero(validacao.numero)}
              </p>
            ) : (
              numero.replace(/\D/g, "").length === 20 &&
              validacao && <p className="mt-2 text-sm text-destructive">{validacao.erro}</p>
            )}
          </div>

          <Field label="Cliente">
            <Select
              value={clienteId}
              onChange={setClienteId}
              placeholder="Selecione o cliente..."
              options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
            />
          </Field>

          <Field label="Tipo de ação">
            <Input
              value={tipoAcao}
              onChange={setTipoAcao}
              placeholder="Ex.: Ação de Indenização por Danos Morais"
            />
          </Field>

          <Field label="Vara">
            <Input value={vara} onChange={setVara} placeholder="Ex.: 3ª Vara Cível" />
          </Field>

          <Field label="Comarca">
            <Input value={comarca} onChange={setComarca} placeholder="Ex.: Recife/PE" />
          </Field>

          <Field label="Parte contrária">
            <Input
              value={parteContraria}
              onChange={setParteContraria}
              placeholder="Nome da parte adversa"
            />
          </Field>

          <Field label="Status atual">
            <Input
              value={statusAtual}
              onChange={setStatusAtual}
              placeholder="Ex.: Aguardando contestação"
            />
          </Field>

          <Field label="Valor da causa (R$)">
            <Input value={valorCausa} onChange={setValorCausa} placeholder="45000" />
          </Field>

          <Field label="Fase processual">
            <Select
              value={fase}
              onChange={setFase}
              options={fases.map((f) => ({
                value: f,
                label: f.charAt(0).toUpperCase() + f.slice(1),
              }))}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Checkbox
            checked={segredo}
            onChange={setSegredo}
            label="Processo em segredo de justiça"
          />
        </div>

        <div className="mt-5">
          <Field label="Observações internas (opcional)">
            <Textarea
              value={observacoes}
              onChange={setObservacoes}
              rows={3}
              placeholder="Anotações que só aparecem para você."
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-serif text-lg text-card-foreground">Prazo em aberto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe a data diretamente ou use a calculadora, que conta apenas dias úteis e pula
          feriados e o recesso forense (CPC arts. 219 e 220).
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Tipo de prazo">
            <Input
              value={prazoTipo}
              onChange={setPrazoTipo}
              placeholder="Ex.: Réplica à contestação"
            />
          </Field>
          <Field label="Data limite (se já souber)">
            <Input type="date" value={prazoData} onChange={setPrazoData} />
          </Field>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Calculadora de prazo
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Data da intimação">
              <Input type="date" value={intimacao} onChange={setIntimacao} />
            </Field>
            <Field label="Prazo legal">
              <Select
                value={diasPrazo}
                onChange={setDiasPrazo}
                options={[
                  ...prazosComuns.map((p) => ({ value: String(p.dias), label: p.label })),
                  { value: "10", label: "Outro — 10 dias úteis" },
                  { value: "30", label: "Outro — 30 dias úteis" },
                ]}
              />
            </Field>
          </div>
          {vencimentoCalculado && (
            <Aviso tone="destaque" icon={<Sparkles className="size-5" strokeWidth={1.5} />}>
              Vencimento calculado:{" "}
              <strong className="font-medium">
                {formatDate(vencimentoCalculado.toISOString())}
              </strong>
              {!prazoData && " — será usado se você não preencher a data limite acima."}
            </Aviso>
          )}
        </div>
      </Card>

      {erro && (
        <Aviso tone="perigo" icon={<Info className="size-5" strokeWidth={1.5} />}>
          {erro}
        </Aviso>
      )}

      <div className="flex justify-end gap-2">
        <Link
          to="/app/processos"
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </Link>
        <Button type="submit" variant="accent">
          <PencilLine className="size-4" strokeWidth={1.5} />
          Cadastrar processo
        </Button>
      </div>
    </form>
  );
}
