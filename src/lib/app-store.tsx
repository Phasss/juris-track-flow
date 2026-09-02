import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  atividadesMock,
  audienciasMock,
  clientesMock,
  documentosMock,
  mensagensMock,
  perfilMock,
  preferenciasMock,
  processosMock,
  tarefasMock,
  templatesMensagemMock,
  templatesMock,
  type Andamento,
  type Atividade,
  type Audiencia,
  type ChecklistTemplate,
  type Cliente,
  type Documento,
  type Mensagem,
  type Preferencias,
  type Processo,
  type Tarefa,
  type TemplateMensagem,
} from "./mock-data";
import type { ProcessoPje } from "./pje/types";

/**
 * Camada única de dados do protótipo.
 * Tudo vive em estado local. Quando as integrações reais existirem
 * (API do PJe, API do WhatsApp), basta trocar as funções deste provider
 * por chamadas de servidor — a interface consumida pelas telas não muda.
 */

type Perfil = typeof perfilMock;

export type NovoProcesso = Omit<Processo, "id" | "andamentos" | "checklist"> & {
  andamentos?: Andamento[];
  checklist?: Processo["checklist"];
};

type AppState = {
  autenticado: boolean;
  entrar: (email: string) => void;
  sair: () => void;
  usuarioEmail: string;

  clientes: Cliente[];
  processos: Processo[];
  mensagens: Mensagem[];
  templates: ChecklistTemplate[];
  templatesMensagem: TemplateMensagem[];
  documentos: Documento[];
  tarefas: Tarefa[];
  audiencias: Audiencia[];
  atividades: Atividade[];
  perfil: Perfil;
  preferencias: Preferencias;

  clientePorId: (id: string) => Cliente | undefined;
  processoPorId: (id: string) => Processo | undefined;
  processosDoCliente: (clienteId: string) => Processo[];
  mensagensDoCliente: (clienteId: string) => Mensagem[];
  documentosDoProcesso: (processoId: string) => Documento[];
  documentosDoCliente: (clienteId: string) => Documento[];
  tarefasDoProcesso: (processoId: string) => Tarefa[];
  audienciasDoProcesso: (processoId: string) => Audiencia[];

  adicionarItemChecklist: (processoId: string, titulo: string, prazo?: string) => void;
  alternarItemChecklist: (processoId: string, itemId: string) => void;
  removerItemChecklist: (processoId: string, itemId: string) => void;
  aplicarTemplate: (processoId: string, templateId: string) => void;

  notificarCliente: (processoId: string, texto: string) => void;

  criarTemplate: (t: Omit<ChecklistTemplate, "id">) => void;
  atualizarTemplate: (id: string, t: Omit<ChecklistTemplate, "id">) => void;
  removerTemplate: (id: string) => void;

  criarTemplateMensagem: (t: Omit<TemplateMensagem, "id">) => void;
  removerTemplateMensagem: (id: string) => void;

  criarProcesso: (p: NovoProcesso) => string;
  atualizarProcesso: (id: string, p: Partial<Processo>) => void;
  removerProcesso: (id: string) => void;
  adicionarAndamento: (processoId: string, a: Omit<Andamento, "id">) => void;
  /** Funde os movimentos vindos do PJe, ignorando os já registrados. */
  sincronizarComPje: (processoId: string, pje: ProcessoPje) => number;

  criarCliente: (c: Omit<Cliente, "id">) => string;
  atualizarCliente: (id: string, c: Partial<Cliente>) => void;
  removerCliente: (id: string) => void;

  adicionarDocumento: (d: Omit<Documento, "id">) => void;
  removerDocumento: (id: string) => void;

  criarTarefa: (t: Omit<Tarefa, "id" | "criadaEm">) => void;
  atualizarTarefa: (id: string, t: Partial<Tarefa>) => void;
  removerTarefa: (id: string) => void;

  criarAudiencia: (a: Omit<Audiencia, "id">) => void;
  atualizarAudiencia: (id: string, a: Partial<Audiencia>) => void;
  removerAudiencia: (id: string) => void;

  atualizarPerfil: (p: Perfil) => void;
  atualizarPreferencias: (p: Preferencias) => void;
};

const AppContext = createContext<AppState | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function AppProvider({ children }: { children: ReactNode }) {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioEmail, setUsuarioEmail] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [processos, setProcessos] = useState<Processo[]>(processosMock);
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensMock);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(templatesMock);
  const [templatesMensagem, setTemplatesMensagem] =
    useState<TemplateMensagem[]>(templatesMensagemMock);
  const [documentos, setDocumentos] = useState<Documento[]>(documentosMock);
  const [tarefas, setTarefas] = useState<Tarefa[]>(tarefasMock);
  const [audiencias, setAudiencias] = useState<Audiencia[]>(audienciasMock);
  const [atividades, setAtividades] = useState<Atividade[]>(atividadesMock);
  const [perfil, setPerfil] = useState<Perfil>(perfilMock);
  const [preferencias, setPreferencias] = useState<Preferencias>(preferenciasMock);

  const entrar = useCallback((email: string) => {
    setUsuarioEmail(email);
    setAutenticado(true);
  }, []);

  const sair = useCallback(() => {
    setAutenticado(false);
    setUsuarioEmail("");
  }, []);

  const mutarProcesso = useCallback((id: string, fn: (p: Processo) => Processo) => {
    setProcessos((atual) => atual.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  const registrar = useCallback((tipo: Atividade["tipo"], texto: string) => {
    setAtividades((a) => [{ id: uid(), tipo, texto, data: new Date().toISOString() }, ...a]);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      autenticado,
      entrar,
      sair,
      usuarioEmail,
      clientes,
      processos,
      mensagens,
      templates,
      templatesMensagem,
      documentos,
      tarefas,
      audiencias,
      atividades,
      perfil,
      preferencias,

      clientePorId: (id) => clientes.find((c) => c.id === id),
      processoPorId: (id) => processos.find((p) => p.id === id),
      processosDoCliente: (clienteId) => processos.filter((p) => p.clienteId === clienteId),
      mensagensDoCliente: (clienteId) =>
        mensagens
          .filter((m) => m.clienteId === clienteId)
          .sort((a, b) => +new Date(b.data) - +new Date(a.data)),
      documentosDoProcesso: (processoId) =>
        documentos
          .filter((d) => d.processoId === processoId)
          .sort((a, b) => +new Date(b.data) - +new Date(a.data)),
      documentosDoCliente: (clienteId) =>
        documentos
          .filter((d) => d.clienteId === clienteId)
          .sort((a, b) => +new Date(b.data) - +new Date(a.data)),
      tarefasDoProcesso: (processoId) => tarefas.filter((t) => t.processoId === processoId),
      audienciasDoProcesso: (processoId) =>
        audiencias
          .filter((a) => a.processoId === processoId)
          .sort((a, b) => +new Date(a.data) - +new Date(b.data)),

      adicionarItemChecklist: (processoId, titulo, prazo) =>
        mutarProcesso(processoId, (p) => ({
          ...p,
          checklist: [
            ...p.checklist,
            { id: uid(), titulo, concluido: false, ...(prazo ? { prazo } : {}) },
          ],
        })),

      alternarItemChecklist: (processoId, itemId) =>
        mutarProcesso(processoId, (p) => ({
          ...p,
          checklist: p.checklist.map((i) =>
            i.id === itemId ? { ...i, concluido: !i.concluido } : i,
          ),
        })),

      removerItemChecklist: (processoId, itemId) =>
        mutarProcesso(processoId, (p) => ({
          ...p,
          checklist: p.checklist.filter((i) => i.id !== itemId),
        })),

      aplicarTemplate: (processoId, templateId) => {
        const tpl = templates.find((t) => t.id === templateId);
        if (!tpl) return;
        mutarProcesso(processoId, (p) => ({
          ...p,
          checklist: [
            ...p.checklist,
            ...tpl.itens.map((titulo) => ({ id: uid(), titulo, concluido: false })),
          ],
        }));
      },

      notificarCliente: (processoId, texto) => {
        const processo = processos.find((p) => p.id === processoId);
        if (!processo) return;
        const cliente = clientes.find((c) => c.id === processo.clienteId);
        const agora = new Date().toISOString();
        setMensagens((m) => [
          {
            id: uid(),
            clienteId: processo.clienteId,
            processoId,
            data: agora,
            texto,
            canal: "whatsapp",
          },
          ...m,
        ]);
        registrar(
          "mensagem",
          `Atualização enviada por WhatsApp para ${cliente?.nome ?? "cliente"}.`,
        );
      },

      criarTemplate: (t) => setTemplates((atual) => [{ id: uid(), ...t }, ...atual]),
      atualizarTemplate: (id, t) =>
        setTemplates((atual) => atual.map((x) => (x.id === id ? { id, ...t } : x))),
      removerTemplate: (id) => setTemplates((atual) => atual.filter((x) => x.id !== id)),

      criarTemplateMensagem: (t) =>
        setTemplatesMensagem((atual) => [{ id: uid(), ...t }, ...atual]),
      removerTemplateMensagem: (id) =>
        setTemplatesMensagem((atual) => atual.filter((x) => x.id !== id)),

      criarProcesso: (p) => {
        const id = `proc-${uid()}`;
        setProcessos((atual) => [
          { ...p, id, andamentos: p.andamentos ?? [], checklist: p.checklist ?? [] },
          ...atual,
        ]);
        registrar("andamento", `Processo ${p.numero} cadastrado na carteira.`);
        return id;
      },

      atualizarProcesso: (id, dados) => mutarProcesso(id, (p) => ({ ...p, ...dados })),

      removerProcesso: (id) => {
        setProcessos((atual) => atual.filter((p) => p.id !== id));
        setTarefas((atual) => atual.filter((t) => t.processoId !== id));
        setAudiencias((atual) => atual.filter((a) => a.processoId !== id));
        setDocumentos((atual) => atual.filter((d) => d.processoId !== id));
      },

      adicionarAndamento: (processoId, andamento) =>
        mutarProcesso(processoId, (p) => ({
          ...p,
          ultimaMovimentacao: andamento.data,
          andamentos: [{ id: uid(), ...andamento }, ...p.andamentos].sort(
            (a, b) => +new Date(b.data) - +new Date(a.data),
          ),
        })),

      sincronizarComPje: (processoId, pje) => {
        const processo = processos.find((p) => p.id === processoId);
        if (!processo) return 0;

        const conhecidos = new Set(
          processo.andamentos.map((a) => `${a.titulo}|${a.data.slice(0, 10)}`),
        );
        const novos = pje.movimentos
          .filter((m) => !conhecidos.has(`${m.titulo}|${m.data.slice(0, 10)}`))
          .map<Andamento>((m) => ({
            id: uid(),
            data: m.data,
            titulo: m.titulo,
            descricao: m.descricao,
            origem: "pje",
          }));

        const agora = new Date().toISOString();
        mutarProcesso(processoId, (p) => {
          const andamentos = [...novos, ...p.andamentos].sort(
            (a, b) => +new Date(b.data) - +new Date(a.data),
          );
          return {
            ...p,
            andamentos,
            sincronizadoEm: agora,
            ultimaMovimentacao: andamentos[0]?.data ?? p.ultimaMovimentacao,
          };
        });

        if (novos.length > 0) {
          const cliente = clientes.find((c) => c.id === processo.clienteId);
          registrar(
            "andamento",
            `${novos.length} ${novos.length === 1 ? "novo andamento importado" : "novos andamentos importados"} do PJe — ${cliente?.nome ?? processo.numero}.`,
          );
        }

        return novos.length;
      },

      criarCliente: (c) => {
        const id = `cli-${uid()}`;
        setClientes((atual) => [{ ...c, id }, ...atual]);
        return id;
      },
      atualizarCliente: (id, dados) =>
        setClientes((atual) => atual.map((c) => (c.id === id ? { ...c, ...dados } : c))),
      removerCliente: (id) => setClientes((atual) => atual.filter((c) => c.id !== id)),

      adicionarDocumento: (doc) => {
        setDocumentos((atual) => [{ id: `doc-${uid()}`, ...doc }, ...atual]);
        registrar("documento", `Documento anexado — ${doc.nome}.`);
      },
      removerDocumento: (id) => setDocumentos((atual) => atual.filter((d) => d.id !== id)),

      criarTarefa: (t) => {
        setTarefas((atual) => [
          { id: `tar-${uid()}`, criadaEm: new Date().toISOString(), ...t },
          ...atual,
        ]);
        registrar("tarefa", `Nova tarefa criada — ${t.titulo}.`);
      },
      atualizarTarefa: (id, dados) =>
        setTarefas((atual) =>
          atual.map((t) => {
            if (t.id !== id) return t;
            const atualizada = { ...t, ...dados };
            if (dados.status === "concluida" && t.status !== "concluida") {
              atualizada.concluidaEm = new Date().toISOString();
            }
            if (dados.status && dados.status !== "concluida") {
              atualizada.concluidaEm = undefined;
            }
            return atualizada;
          }),
        ),
      removerTarefa: (id) => setTarefas((atual) => atual.filter((t) => t.id !== id)),

      criarAudiencia: (a) => {
        setAudiencias((atual) => [{ id: `aud-${uid()}`, ...a }, ...atual]);
        registrar(
          "audiencia",
          `Audiência designada para ${new Date(a.data).toLocaleDateString("pt-BR")}.`,
        );
      },
      atualizarAudiencia: (id, dados) =>
        setAudiencias((atual) => atual.map((a) => (a.id === id ? { ...a, ...dados } : a))),
      removerAudiencia: (id) => setAudiencias((atual) => atual.filter((a) => a.id !== id)),

      atualizarPerfil: (p) => setPerfil(p),
      atualizarPreferencias: (p) => setPreferencias(p),
    }),
    [
      autenticado,
      entrar,
      sair,
      usuarioEmail,
      clientes,
      processos,
      mensagens,
      templates,
      templatesMensagem,
      documentos,
      tarefas,
      audiencias,
      atividades,
      perfil,
      preferencias,
      mutarProcesso,
      registrar,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>");
  return ctx;
}
