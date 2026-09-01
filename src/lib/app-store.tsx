import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  atividadesMock,
  clientesMock,
  mensagensMock,
  perfilMock,
  processosMock,
  templatesMock,
  type Atividade,
  type ChecklistTemplate,
  type Cliente,
  type Mensagem,
  type Processo,
} from "./mock-data";

/**
 * Camada única de dados do protótipo.
 * Tudo vive em estado local. Quando as integrações reais existirem
 * (API do PJe, API do WhatsApp), basta trocar as funções deste provider
 * por chamadas de servidor — a interface consumida pelas telas não muda.
 */

type Perfil = typeof perfilMock;

type AppState = {
  autenticado: boolean;
  entrar: (email: string) => void;
  sair: () => void;
  usuarioEmail: string;

  clientes: Cliente[];
  processos: Processo[];
  mensagens: Mensagem[];
  templates: ChecklistTemplate[];
  atividades: Atividade[];
  perfil: Perfil;

  clientePorId: (id: string) => Cliente | undefined;
  processoPorId: (id: string) => Processo | undefined;
  processosDoCliente: (clienteId: string) => Processo[];
  mensagensDoCliente: (clienteId: string) => Mensagem[];

  adicionarItemChecklist: (processoId: string, titulo: string, prazo?: string) => void;
  alternarItemChecklist: (processoId: string, itemId: string) => void;
  removerItemChecklist: (processoId: string, itemId: string) => void;
  aplicarTemplate: (processoId: string, templateId: string) => void;

  notificarCliente: (processoId: string, texto: string) => void;

  criarTemplate: (t: Omit<ChecklistTemplate, "id">) => void;
  atualizarTemplate: (id: string, t: Omit<ChecklistTemplate, "id">) => void;
  removerTemplate: (id: string) => void;

  atualizarPerfil: (p: Perfil) => void;
};

const AppContext = createContext<AppState | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function AppProvider({ children }: { children: ReactNode }) {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioEmail, setUsuarioEmail] = useState("");
  const [clientes] = useState<Cliente[]>(clientesMock);
  const [processos, setProcessos] = useState<Processo[]>(processosMock);
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensMock);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(templatesMock);
  const [atividades, setAtividades] = useState<Atividade[]>(atividadesMock);
  const [perfil, setPerfil] = useState<Perfil>(perfilMock);

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
      atividades,
      perfil,

      clientePorId: (id) => clientes.find((c) => c.id === id),
      processoPorId: (id) => processos.find((p) => p.id === id),
      processosDoCliente: (clienteId) => processos.filter((p) => p.clienteId === clienteId),
      mensagensDoCliente: (clienteId) =>
        mensagens
          .filter((m) => m.clienteId === clienteId)
          .sort((a, b) => +new Date(b.data) - +new Date(a.data)),

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
          { id: uid(), clienteId: processo.clienteId, processoId, data: agora, texto, canal: "whatsapp" },
          ...m,
        ]);
        setAtividades((a) => [
          {
            id: uid(),
            tipo: "mensagem",
            texto: `Atualização enviada por WhatsApp para ${cliente?.nome ?? "cliente"}.`,
            data: agora,
          },
          ...a,
        ]);
      },

      criarTemplate: (t) => setTemplates((atual) => [{ id: uid(), ...t }, ...atual]),
      atualizarTemplate: (id, t) =>
        setTemplates((atual) => atual.map((x) => (x.id === id ? { id, ...t } : x))),
      removerTemplate: (id) => setTemplates((atual) => atual.filter((x) => x.id !== id)),

      atualizarPerfil: (p) => setPerfil(p),
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
      atividades,
      perfil,
      mutarProcesso,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>");
  return ctx;
}
