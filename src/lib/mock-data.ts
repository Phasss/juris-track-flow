export type PrazoStatus = "no-prazo" | "atencao" | "vencido";

export type Andamento = {
  id: string;
  data: string; // ISO
  titulo: string;
  descricao: string;
};

export type ChecklistItem = {
  id: string;
  titulo: string;
  concluido: boolean;
  prazo?: string; // ISO date
};

export type Processo = {
  id: string;
  numero: string;
  clienteId: string;
  tipoAcao: string;
  vara: string;
  comarca: string;
  statusAtual: string;
  ultimaMovimentacao: string; // ISO
  prazoTipo: string;
  prazoData: string; // ISO
  andamentos: Andamento[];
  checklist: ChecklistItem[];
};

export type Mensagem = {
  id: string;
  clienteId: string;
  processoId?: string;
  data: string; // ISO
  texto: string;
  canal: "whatsapp";
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
};

export type ChecklistTemplate = {
  id: string;
  nome: string;
  descricao: string;
  itens: string[];
};

export type Atividade = {
  id: string;
  tipo: "andamento" | "prazo" | "mensagem";
  texto: string;
  data: string; // ISO
};

const hoje = new Date();
const d = (offsetDias: number) => {
  const dt = new Date(hoje);
  dt.setDate(dt.getDate() + offsetDias);
  dt.setHours(12, 0, 0, 0);
  return dt.toISOString();
};

export const clientesMock: Cliente[] = [
  {
    id: "cli-1",
    nome: "Maria Silva Andrade",
    telefone: "(81) 98812-4471",
    email: "maria.andrade@email.com",
  },
  {
    id: "cli-2",
    nome: "João Pereira dos Santos",
    telefone: "(81) 99632-1188",
    email: "joao.pereira@email.com",
  },
  {
    id: "cli-3",
    nome: "Construtora Horizonte Ltda.",
    telefone: "(81) 3322-7788",
    email: "juridico@horizonteconstrutora.com.br",
  },
  {
    id: "cli-4",
    nome: "Ana Beatriz Nogueira",
    telefone: "(81) 98450-2210",
    email: "ana.nogueira@email.com",
  },
  {
    id: "cli-5",
    nome: "Rafael Monteiro Lima",
    telefone: "(81) 99117-6603",
    email: "rafael.lima@email.com",
  },
];

export const processosMock: Processo[] = [
  {
    id: "proc-1",
    numero: "0001234-56.2024.8.17.0001",
    clienteId: "cli-1",
    tipoAcao: "Ação de Indenização por Danos Morais",
    vara: "3ª Vara Cível",
    comarca: "Recife/PE",
    statusAtual: "Aguardando contestação",
    ultimaMovimentacao: d(-2),
    prazoTipo: "Réplica à contestação",
    prazoData: d(3),
    andamentos: [
      {
        id: "and-1-1",
        data: d(-2),
        titulo: "Juntada de petição",
        descricao: "Juntada de contestação apresentada pela parte ré, com documentos.",
      },
      {
        id: "and-1-2",
        data: d(-18),
        titulo: "Citação cumprida",
        descricao: "Certidão do oficial de justiça informando a citação pessoal da parte ré.",
      },
      {
        id: "and-1-3",
        data: d(-34),
        titulo: "Despacho",
        descricao: "Cite-se a parte ré para apresentar contestação no prazo legal de 15 dias.",
      },
      {
        id: "and-1-4",
        data: d(-41),
        titulo: "Distribuição",
        descricao: "Distribuído por sorteio à 3ª Vara Cível da Comarca do Recife.",
      },
    ],
    checklist: [
      { id: "chk-1-1", titulo: "Protocolar petição inicial", concluido: true },
      { id: "chk-1-2", titulo: "Acompanhar citação da parte ré", concluido: true },
      { id: "chk-1-3", titulo: "Elaborar réplica", concluido: false, prazo: d(3) },
      { id: "chk-1-4", titulo: "Especificar provas", concluido: false, prazo: d(17) },
    ],
  },
  {
    id: "proc-2",
    numero: "0007788-21.2024.5.06.0012",
    clienteId: "cli-2",
    tipoAcao: "Reclamação Trabalhista",
    vara: "12ª Vara do Trabalho",
    comarca: "Recife/PE",
    statusAtual: "Instrução processual",
    ultimaMovimentacao: d(-1),
    prazoTipo: "Razões finais",
    prazoData: d(-1),
    andamentos: [
      {
        id: "and-2-1",
        data: d(-1),
        titulo: "Ata de audiência",
        descricao:
          "Realizada audiência de instrução. Encerrada a instrução, partes intimadas para razões finais.",
      },
      {
        id: "and-2-2",
        data: d(-27),
        titulo: "Designação de audiência",
        descricao: "Designada audiência de instrução e julgamento.",
      },
      {
        id: "and-2-3",
        data: d(-52),
        titulo: "Defesa apresentada",
        descricao: "Reclamada apresentou defesa escrita com preliminares.",
      },
    ],
    checklist: [
      { id: "chk-2-1", titulo: "Reunir documentos do vínculo", concluido: true },
      { id: "chk-2-2", titulo: "Arrolar testemunhas", concluido: true },
      { id: "chk-2-3", titulo: "Protocolar razões finais", concluido: false, prazo: d(-1) },
    ],
  },
  {
    id: "proc-3",
    numero: "0004521-09.2023.8.17.2001",
    clienteId: "cli-3",
    tipoAcao: "Execução de Título Extrajudicial",
    vara: "1ª Vara Cível",
    comarca: "Jaboatão dos Guararapes/PE",
    statusAtual: "Penhora deferida",
    ultimaMovimentacao: d(-9),
    prazoTipo: "Manifestação sobre penhora",
    prazoData: d(6),
    andamentos: [
      {
        id: "and-3-1",
        data: d(-9),
        titulo: "Decisão",
        descricao: "Deferida a penhora online via SISBAJUD sobre ativos financeiros da executada.",
      },
      {
        id: "and-3-2",
        data: d(-40),
        titulo: "Certidão",
        descricao: "Decorrido o prazo para embargos à execução sem manifestação.",
      },
    ],
    checklist: [
      { id: "chk-3-1", titulo: "Atualizar cálculo do débito", concluido: true },
      { id: "chk-3-2", titulo: "Manifestar sobre valores bloqueados", concluido: false, prazo: d(6) },
    ],
  },
  {
    id: "proc-4",
    numero: "0002210-77.2022.8.17.0480",
    clienteId: "cli-4",
    tipoAcao: "Inventário e Partilha",
    vara: "2ª Vara de Família e Sucessões",
    comarca: "Olinda/PE",
    statusAtual: "Aguardando plano de partilha",
    ultimaMovimentacao: d(-63),
    prazoTipo: "Apresentar últimas declarações",
    prazoData: d(21),
    andamentos: [
      {
        id: "and-4-1",
        data: d(-63),
        titulo: "Despacho",
        descricao: "Intimem-se os herdeiros para apresentarem as últimas declarações.",
      },
      {
        id: "and-4-2",
        data: d(-120),
        titulo: "Juntada de documentos",
        descricao: "Juntada de certidões negativas de débitos fiscais.",
      },
    ],
    checklist: [
      { id: "chk-4-1", titulo: "Coletar certidões dos herdeiros", concluido: true },
      { id: "chk-4-2", titulo: "Elaborar últimas declarações", concluido: false, prazo: d(21) },
      { id: "chk-4-3", titulo: "Calcular ITCMD", concluido: false },
    ],
  },
  {
    id: "proc-5",
    numero: "0009087-33.2025.8.17.0001",
    clienteId: "cli-5",
    tipoAcao: "Ação Revisional de Contrato Bancário",
    vara: "9ª Vara Cível",
    comarca: "Recife/PE",
    statusAtual: "Aguardando citação",
    ultimaMovimentacao: d(-5),
    prazoTipo: "Comprovar recolhimento de custas",
    prazoData: d(12),
    andamentos: [
      {
        id: "and-5-1",
        data: d(-5),
        titulo: "Despacho inicial",
        descricao: "Recebida a inicial. Cite-se. Comprovem-se as custas em 15 dias.",
      },
      {
        id: "and-5-2",
        data: d(-6),
        titulo: "Distribuição",
        descricao: "Processo distribuído por sorteio à 9ª Vara Cível.",
      },
    ],
    checklist: [
      { id: "chk-5-1", titulo: "Protocolar petição inicial", concluido: true },
      { id: "chk-5-2", titulo: "Recolher custas iniciais", concluido: false, prazo: d(12) },
    ],
  },
  {
    id: "proc-6",
    numero: "0003345-88.2023.8.17.0810",
    clienteId: "cli-1",
    tipoAcao: "Ação de Alimentos",
    vara: "1ª Vara de Família",
    comarca: "Caruaru/PE",
    statusAtual: "Sentença publicada",
    ultimaMovimentacao: d(-88),
    prazoTipo: "Cumprimento de sentença",
    prazoData: d(45),
    andamentos: [
      {
        id: "and-6-1",
        data: d(-88),
        titulo: "Sentença",
        descricao: "Julgado procedente o pedido, fixados alimentos em 30% do salário mínimo.",
      },
    ],
    checklist: [{ id: "chk-6-1", titulo: "Comunicar cliente sobre a sentença", concluido: true }],
  },
];

export const mensagensMock: Mensagem[] = [
  {
    id: "msg-1",
    clienteId: "cli-1",
    processoId: "proc-1",
    data: d(-2),
    canal: "whatsapp",
    texto:
      "Olá, Maria! Houve um novo andamento no seu processo 0001234-56.2024.8.17.0001: a parte contrária apresentou contestação. Vamos preparar a resposta. Qualquer novidade eu aviso por aqui.",
  },
  {
    id: "msg-2",
    clienteId: "cli-2",
    processoId: "proc-2",
    data: d(-1),
    canal: "whatsapp",
    texto:
      "Olá, João! A audiência de instrução foi realizada e a instrução foi encerrada. Agora apresentaremos as razões finais.",
  },
  {
    id: "msg-3",
    clienteId: "cli-3",
    processoId: "proc-3",
    data: d(-9),
    canal: "whatsapp",
    texto:
      "Bom dia! Informamos que a penhora foi deferida no processo de execução. Seguiremos acompanhando os valores bloqueados.",
  },
  {
    id: "msg-4",
    clienteId: "cli-4",
    processoId: "proc-4",
    data: d(-60),
    canal: "whatsapp",
    texto:
      "Olá, Ana! O juiz determinou a apresentação das últimas declarações no inventário. Vou precisar de alguns documentos, envio a lista em seguida.",
  },
];

export const templatesMock: ChecklistTemplate[] = [
  {
    id: "tpl-1",
    nome: "Ação Trabalhista Padrão",
    descricao: "Fluxo típico de uma reclamação trabalhista até a sentença.",
    itens: [
      "Reunir documentos do vínculo empregatício",
      "Elaborar e protocolar reclamação",
      "Preparar cliente para audiência inicial",
      "Arrolar testemunhas",
      "Protocolar razões finais",
    ],
  },
  {
    id: "tpl-2",
    nome: "Processo de Inventário",
    descricao: "Etapas do inventário judicial, das certidões à partilha.",
    itens: [
      "Coletar certidões dos herdeiros",
      "Levantar bens e avaliações",
      "Elaborar primeiras declarações",
      "Calcular e recolher ITCMD",
      "Apresentar plano de partilha",
    ],
  },
  {
    id: "tpl-3",
    nome: "Execução de Título Extrajudicial",
    descricao: "Acompanhamento de execução com pesquisa patrimonial.",
    itens: [
      "Atualizar cálculo do débito",
      "Protocolar inicial de execução",
      "Requerer penhora online",
      "Manifestar sobre valores bloqueados",
    ],
  },
];

export const atividadesMock: Atividade[] = [
  {
    id: "atv-1",
    tipo: "andamento",
    texto: "Novo andamento no processo de Maria Silva Andrade — juntada de contestação.",
    data: d(-2),
  },
  {
    id: "atv-2",
    tipo: "prazo",
    texto: "Prazo de réplica em 3 dias — Maria Silva Andrade.",
    data: d(-2),
  },
  {
    id: "atv-3",
    tipo: "mensagem",
    texto: "Atualização enviada por WhatsApp para João Pereira dos Santos.",
    data: d(-1),
  },
  {
    id: "atv-4",
    tipo: "andamento",
    texto: "Audiência de instrução realizada — João Pereira dos Santos.",
    data: d(-1),
  },
  {
    id: "atv-5",
    tipo: "prazo",
    texto: "Prazo de razões finais vencido — João Pereira dos Santos.",
    data: d(-1),
  },
  {
    id: "atv-6",
    tipo: "andamento",
    texto: "Penhora deferida no processo da Construtora Horizonte Ltda.",
    data: d(-9),
  },
];

export const perfilMock = {
  escritorio: "Almeida Advocacia",
  responsavel: "Dra. Ana Almeida",
  oab: "OAB/PE 123.456",
  email: "contato@almeidaadvocacia.adv.br",
  telefone: "(81) 3030-1200",
};
