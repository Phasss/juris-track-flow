export type PrazoStatus = "no-prazo" | "atencao" | "vencido";

/** De onde o processo veio: importado do PJe ou cadastrado à mão pelo advogado. */
export type OrigemProcesso = "pje" | "manual";

export type FaseProcesso = "conhecimento" | "instrucao" | "recursal" | "execucao" | "arquivado";

export type Andamento = {
  id: string;
  data: string; // ISO
  titulo: string;
  descricao: string;
  origem?: OrigemProcesso | undefined;
};

export type ChecklistItem = {
  id: string;
  titulo: string;
  concluido: boolean;
  prazo?: string | undefined; // ISO date
};

export type Processo = {
  id: string;
  numero: string;
  clienteId: string;
  tipoAcao: string;
  vara: string;
  comarca: string;
  tribunal: string;
  statusAtual: string;
  ultimaMovimentacao: string; // ISO
  prazoTipo: string;
  prazoData: string; // ISO
  andamentos: Andamento[];
  checklist: ChecklistItem[];
  origem: OrigemProcesso;
  fase: FaseProcesso;
  parteContraria: string;
  valorCausa?: number | undefined;
  segredoJustica: boolean;
  sincronizadoEm?: string | undefined; // ISO — última sincronização com o PJe
  observacoes?: string | undefined;
};

export type Mensagem = {
  id: string;
  clienteId: string;
  processoId?: string | undefined;
  data: string; // ISO
  texto: string;
  canal: "whatsapp";
};

export type TipoPessoa = "fisica" | "juridica";

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  tipo: TipoPessoa;
  documento: string; // CPF ou CNPJ
  endereco?: string | undefined;
  desde: string; // ISO
  observacoes?: string | undefined;
};

export type ChecklistTemplate = {
  id: string;
  nome: string;
  descricao: string;
  itens: string[];
};

export type Atividade = {
  id: string;
  tipo: "andamento" | "prazo" | "mensagem" | "documento" | "tarefa" | "audiencia";
  texto: string;
  data: string; // ISO
};

export type CategoriaDocumento =
  | "peticao"
  | "decisao"
  | "contrato"
  | "procuracao"
  | "documento-pessoal"
  | "prova"
  | "comprovante"
  | "outro";

export type Documento = {
  id: string;
  nome: string;
  categoria: CategoriaDocumento;
  processoId?: string | undefined;
  clienteId?: string | undefined;
  data: string; // ISO
  tamanhoBytes: number;
  extensao: string;
  descricao?: string | undefined;
  tags: string[];
};

export type PrioridadeTarefa = "alta" | "media" | "baixa";
export type StatusTarefa = "pendente" | "em-andamento" | "concluida";

export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string | undefined;
  processoId?: string | undefined;
  prazo?: string | undefined; // ISO
  prioridade: PrioridadeTarefa;
  status: StatusTarefa;
  criadaEm: string; // ISO
  concluidaEm?: string | undefined; // ISO
};

export type TipoAudiencia =
  "conciliacao" | "instrucao" | "una" | "julgamento" | "justificacao" | "outra";

export type ModalidadeAudiencia = "presencial" | "virtual" | "hibrida";
export type StatusAudiencia = "agendada" | "realizada" | "cancelada" | "adiada";

export type Audiencia = {
  id: string;
  processoId: string;
  tipo: TipoAudiencia;
  data: string; // ISO datetime
  local: string;
  modalidade: ModalidadeAudiencia;
  link?: string | undefined;
  status: StatusAudiencia;
  observacoes?: string | undefined;
};

/** Modelo de mensagem para comunicação com o cliente via WhatsApp. */
export type TemplateMensagem = {
  id: string;
  nome: string;
  texto: string; // suporta {{cliente}}, {{processo}}, {{prazo}}
};

const hoje = new Date();

const d = (offsetDias: number) => {
  const dt = new Date(hoje);
  dt.setDate(dt.getDate() + offsetDias);
  dt.setHours(12, 0, 0, 0);
  return dt.toISOString();
};

const dh = (offsetDias: number, hora: number, minuto = 0) => {
  const dt = new Date(hoje);
  dt.setDate(dt.getDate() + offsetDias);
  dt.setHours(hora, minuto, 0, 0);
  return dt.toISOString();
};

export const clientesMock: Cliente[] = [
  {
    id: "cli-1",
    nome: "Maria Silva Andrade",
    telefone: "(81) 98812-4471",
    email: "maria.andrade@email.com",
    tipo: "fisica",
    documento: "047.882.114-20",
    endereco: "Rua da Aurora, 480, apto 902 — Boa Vista, Recife/PE",
    desde: d(-420),
  },
  {
    id: "cli-2",
    nome: "João Pereira dos Santos",
    telefone: "(81) 99632-1188",
    email: "joao.pereira@email.com",
    tipo: "fisica",
    documento: "112.554.784-01",
    endereco: "Av. Caxangá, 2200, casa B — Madalena, Recife/PE",
    desde: d(-380),
  },
  {
    id: "cli-3",
    nome: "Construtora Horizonte Ltda.",
    telefone: "(81) 3322-7788",
    email: "juridico@horizonteconstrutora.com.br",
    tipo: "juridica",
    documento: "18.442.907/0001-64",
    endereco: "Av. Domingos Ferreira, 1050, sala 704 — Boa Viagem, Recife/PE",
    desde: d(-610),
    observacoes: "Contrato de assessoria jurídica mensal. Contato: Dr. Sérgio (jurídico interno).",
  },
  {
    id: "cli-4",
    nome: "Ana Beatriz Nogueira",
    telefone: "(81) 98450-2210",
    email: "ana.nogueira@email.com",
    tipo: "fisica",
    documento: "089.117.334-55",
    endereco: "Rua do Bonfim, 77 — Casa Caiada, Olinda/PE",
    desde: d(-540),
  },
  {
    id: "cli-5",
    nome: "Rafael Monteiro Lima",
    telefone: "(81) 99117-6603",
    email: "rafael.lima@email.com",
    tipo: "fisica",
    documento: "134.900.284-12",
    endereco: "Rua Setúbal, 1420, apto 301 — Boa Viagem, Recife/PE",
    desde: d(-95),
  },
];

export const processosMock: Processo[] = [
  {
    id: "proc-1",
    numero: "0001234-29.2024.8.17.0001",
    clienteId: "cli-1",
    tipoAcao: "Ação de Indenização por Danos Morais",
    vara: "3ª Vara Cível",
    comarca: "Recife/PE",
    tribunal: "TJPE",
    statusAtual: "Aguardando contestação",
    ultimaMovimentacao: d(-2),
    prazoTipo: "Réplica à contestação",
    prazoData: d(3),
    origem: "pje",
    fase: "conhecimento",
    parteContraria: "Telecom Nordeste S/A",
    valorCausa: 45000,
    segredoJustica: false,
    sincronizadoEm: d(-2),
    andamentos: [
      {
        id: "and-1-1",
        data: d(-2),
        titulo: "Juntada de petição",
        descricao: "Juntada de contestação apresentada pela parte ré, com documentos.",
        origem: "pje",
      },
      {
        id: "and-1-2",
        data: d(-18),
        titulo: "Citação cumprida",
        descricao: "Certidão do oficial de justiça informando a citação pessoal da parte ré.",
        origem: "pje",
      },
      {
        id: "and-1-3",
        data: d(-34),
        titulo: "Despacho",
        descricao: "Cite-se a parte ré para apresentar contestação no prazo legal de 15 dias.",
        origem: "pje",
      },
      {
        id: "and-1-4",
        data: d(-41),
        titulo: "Distribuição",
        descricao: "Distribuído por sorteio à 3ª Vara Cível da Comarca do Recife.",
        origem: "pje",
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
    numero: "0007788-02.2024.5.06.0012",
    clienteId: "cli-2",
    tipoAcao: "Reclamação Trabalhista",
    vara: "12ª Vara do Trabalho",
    comarca: "Recife/PE",
    tribunal: "TRT6",
    statusAtual: "Instrução processual",
    ultimaMovimentacao: d(-1),
    prazoTipo: "Razões finais",
    prazoData: d(-1),
    origem: "pje",
    fase: "instrucao",
    parteContraria: "Distribuidora Alfa Ltda.",
    valorCausa: 78500,
    segredoJustica: false,
    sincronizadoEm: d(-1),
    andamentos: [
      {
        id: "and-2-1",
        data: d(-1),
        titulo: "Ata de audiência",
        descricao:
          "Realizada audiência de instrução. Encerrada a instrução, partes intimadas para razões finais.",
        origem: "pje",
      },
      {
        id: "and-2-2",
        data: d(-27),
        titulo: "Designação de audiência",
        descricao: "Designada audiência de instrução e julgamento.",
        origem: "pje",
      },
      {
        id: "and-2-3",
        data: d(-52),
        titulo: "Defesa apresentada",
        descricao: "Reclamada apresentou defesa escrita com preliminares.",
        origem: "pje",
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
    numero: "0004521-48.2023.8.17.2001",
    clienteId: "cli-3",
    tipoAcao: "Execução de Título Extrajudicial",
    vara: "1ª Vara Cível",
    comarca: "Jaboatão dos Guararapes/PE",
    tribunal: "TJPE",
    statusAtual: "Penhora deferida",
    ultimaMovimentacao: d(-9),
    prazoTipo: "Manifestação sobre penhora",
    prazoData: d(6),
    origem: "pje",
    fase: "execucao",
    parteContraria: "Comercial Ipojuca ME",
    valorCausa: 132400,
    segredoJustica: false,
    sincronizadoEm: d(-9),
    andamentos: [
      {
        id: "and-3-1",
        data: d(-9),
        titulo: "Decisão",
        descricao: "Deferida a penhora online via SISBAJUD sobre ativos financeiros da executada.",
        origem: "pje",
      },
      {
        id: "and-3-2",
        data: d(-40),
        titulo: "Certidão",
        descricao: "Decorrido o prazo para embargos à execução sem manifestação.",
        origem: "pje",
      },
    ],
    checklist: [
      { id: "chk-3-1", titulo: "Atualizar cálculo do débito", concluido: true },
      {
        id: "chk-3-2",
        titulo: "Manifestar sobre valores bloqueados",
        concluido: false,
        prazo: d(6),
      },
    ],
  },
  {
    id: "proc-4",
    numero: "0002210-25.2022.8.17.0480",
    clienteId: "cli-4",
    tipoAcao: "Inventário e Partilha",
    vara: "2ª Vara de Família e Sucessões",
    comarca: "Olinda/PE",
    tribunal: "TJPE",
    statusAtual: "Aguardando plano de partilha",
    ultimaMovimentacao: d(-63),
    prazoTipo: "Apresentar últimas declarações",
    prazoData: d(21),
    origem: "pje",
    fase: "conhecimento",
    parteContraria: "Espólio de Antônio Nogueira",
    valorCausa: 890000,
    segredoJustica: true,
    sincronizadoEm: d(-63),
    andamentos: [
      {
        id: "and-4-1",
        data: d(-63),
        titulo: "Despacho",
        descricao: "Intimem-se os herdeiros para apresentarem as últimas declarações.",
        origem: "pje",
      },
      {
        id: "and-4-2",
        data: d(-120),
        titulo: "Juntada de documentos",
        descricao: "Juntada de certidões negativas de débitos fiscais.",
        origem: "pje",
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
    numero: "0009087-55.2025.8.17.0001",
    clienteId: "cli-5",
    tipoAcao: "Ação Revisional de Contrato Bancário",
    vara: "9ª Vara Cível",
    comarca: "Recife/PE",
    tribunal: "TJPE",
    statusAtual: "Aguardando citação",
    ultimaMovimentacao: d(-5),
    prazoTipo: "Comprovar recolhimento de custas",
    prazoData: d(12),
    origem: "manual",
    fase: "conhecimento",
    parteContraria: "Banco Meridiano S/A",
    valorCausa: 62300,
    segredoJustica: false,
    andamentos: [
      {
        id: "and-5-1",
        data: d(-5),
        titulo: "Despacho inicial",
        descricao: "Recebida a inicial. Cite-se. Comprovem-se as custas em 15 dias.",
        origem: "manual",
      },
      {
        id: "and-5-2",
        data: d(-6),
        titulo: "Distribuição",
        descricao: "Processo distribuído por sorteio à 9ª Vara Cível.",
        origem: "manual",
      },
    ],
    checklist: [
      { id: "chk-5-1", titulo: "Protocolar petição inicial", concluido: true },
      { id: "chk-5-2", titulo: "Recolher custas iniciais", concluido: false, prazo: d(12) },
    ],
  },
  {
    id: "proc-6",
    numero: "0003345-18.2023.8.17.0810",
    clienteId: "cli-1",
    tipoAcao: "Ação de Alimentos",
    vara: "1ª Vara de Família",
    comarca: "Caruaru/PE",
    tribunal: "TJPE",
    statusAtual: "Sentença publicada",
    ultimaMovimentacao: d(-88),
    prazoTipo: "Cumprimento de sentença",
    prazoData: d(45),
    origem: "pje",
    fase: "execucao",
    parteContraria: "Carlos Eduardo Andrade",
    valorCausa: 18000,
    segredoJustica: true,
    sincronizadoEm: d(-88),
    andamentos: [
      {
        id: "and-6-1",
        data: d(-88),
        titulo: "Sentença",
        descricao: "Julgado procedente o pedido, fixados alimentos em 30% do salário mínimo.",
        origem: "pje",
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
      "Olá, Maria! Houve um novo andamento no seu processo 0001234-29.2024.8.17.0001: a parte contrária apresentou contestação. Vamos preparar a resposta. Qualquer novidade eu aviso por aqui.",
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
  {
    id: "tpl-4",
    nome: "Ação de Indenização Cível",
    descricao: "Rito comum, do protocolo à especificação de provas.",
    itens: [
      "Reunir provas do dano",
      "Protocolar petição inicial",
      "Acompanhar citação da parte ré",
      "Elaborar réplica",
      "Especificar provas",
    ],
  },
];

export const documentosMock: Documento[] = [
  {
    id: "doc-1",
    nome: "Petição inicial - Danos Morais.pdf",
    categoria: "peticao",
    processoId: "proc-1",
    clienteId: "cli-1",
    data: d(-41),
    tamanhoBytes: 384_512,
    extensao: "pdf",
    descricao: "Peça inaugural protocolada no PJe com documentos de instrução.",
    tags: ["inicial", "protocolado"],
  },
  {
    id: "doc-2",
    nome: "Procuração ad judicia - Maria Andrade.pdf",
    categoria: "procuracao",
    processoId: "proc-1",
    clienteId: "cli-1",
    data: d(-44),
    tamanhoBytes: 128_900,
    extensao: "pdf",
    tags: ["procuração", "assinado"],
  },
  {
    id: "doc-3",
    nome: "Contestação da parte ré.pdf",
    categoria: "decisao",
    processoId: "proc-1",
    clienteId: "cli-1",
    data: d(-2),
    tamanhoBytes: 902_144,
    extensao: "pdf",
    descricao: "Contestação com preliminar de ilegitimidade passiva.",
    tags: ["parte contrária"],
  },
  {
    id: "doc-4",
    nome: "CTPS e holerites - João Pereira.pdf",
    categoria: "prova",
    processoId: "proc-2",
    clienteId: "cli-2",
    data: d(-60),
    tamanhoBytes: 2_411_008,
    extensao: "pdf",
    descricao: "Documentos que comprovam o vínculo empregatício e a jornada.",
    tags: ["prova", "trabalhista"],
  },
  {
    id: "doc-5",
    nome: "Ata de audiência de instrução.pdf",
    categoria: "decisao",
    processoId: "proc-2",
    clienteId: "cli-2",
    data: d(-1),
    tamanhoBytes: 214_016,
    extensao: "pdf",
    tags: ["audiência"],
  },
  {
    id: "doc-6",
    nome: "Contrato de assessoria - Horizonte.docx",
    categoria: "contrato",
    clienteId: "cli-3",
    data: d(-610),
    tamanhoBytes: 96_256,
    extensao: "docx",
    descricao: "Contrato de honorários mensais com a Construtora Horizonte.",
    tags: ["honorários", "contrato"],
  },
  {
    id: "doc-7",
    nome: "Planilha de cálculo do débito.xlsx",
    categoria: "comprovante",
    processoId: "proc-3",
    clienteId: "cli-3",
    data: d(-30),
    tamanhoBytes: 45_120,
    extensao: "xlsx",
    descricao: "Memória de cálculo atualizada até a data da penhora.",
    tags: ["cálculo", "execução"],
  },
  {
    id: "doc-8",
    nome: "Certidões negativas - herdeiros.pdf",
    categoria: "documento-pessoal",
    processoId: "proc-4",
    clienteId: "cli-4",
    data: d(-120),
    tamanhoBytes: 1_204_224,
    extensao: "pdf",
    tags: ["inventário", "certidões"],
  },
  {
    id: "doc-9",
    nome: "Comprovante de custas iniciais.pdf",
    categoria: "comprovante",
    processoId: "proc-5",
    clienteId: "cli-5",
    data: d(-4),
    tamanhoBytes: 78_848,
    extensao: "pdf",
    tags: ["custas"],
  },
  {
    id: "doc-10",
    nome: "Sentença - Ação de Alimentos.pdf",
    categoria: "decisao",
    processoId: "proc-6",
    clienteId: "cli-1",
    data: d(-88),
    tamanhoBytes: 306_176,
    extensao: "pdf",
    descricao: "Sentença de procedência fixando alimentos em 30% do salário mínimo.",
    tags: ["sentença", "família"],
  },
];

export const tarefasMock: Tarefa[] = [
  {
    id: "tar-1",
    titulo: "Redigir réplica à contestação",
    descricao: "Rebater a preliminar de ilegitimidade passiva e reforçar o nexo causal.",
    processoId: "proc-1",
    prazo: d(2),
    prioridade: "alta",
    status: "em-andamento",
    criadaEm: d(-2),
  },
  {
    id: "tar-2",
    titulo: "Protocolar razões finais",
    descricao: "Prazo já vencido — verificar possibilidade de protocolo com justificativa.",
    processoId: "proc-2",
    prazo: d(-1),
    prioridade: "alta",
    status: "pendente",
    criadaEm: d(-1),
  },
  {
    id: "tar-3",
    titulo: "Solicitar extrato de bloqueio SISBAJUD",
    processoId: "proc-3",
    prazo: d(4),
    prioridade: "media",
    status: "pendente",
    criadaEm: d(-9),
  },
  {
    id: "tar-4",
    titulo: "Reunir documentos do ITCMD com a cliente",
    descricao: "Ana precisa enviar as guias de recolhimento e a avaliação dos imóveis.",
    processoId: "proc-4",
    prazo: d(14),
    prioridade: "media",
    status: "pendente",
    criadaEm: d(-20),
  },
  {
    id: "tar-5",
    titulo: "Enviar relatório mensal para a Construtora Horizonte",
    prazo: d(8),
    prioridade: "baixa",
    status: "pendente",
    criadaEm: d(-3),
  },
  {
    id: "tar-6",
    titulo: "Conferir recolhimento das custas iniciais",
    processoId: "proc-5",
    prazo: d(10),
    prioridade: "media",
    status: "concluida",
    criadaEm: d(-5),
    concluidaEm: d(-4),
  },
  {
    id: "tar-7",
    titulo: "Atualizar cadastro da cliente Maria Andrade",
    descricao: "Novo endereço informado por WhatsApp.",
    prioridade: "baixa",
    status: "concluida",
    criadaEm: d(-12),
    concluidaEm: d(-10),
  },
];

export const audienciasMock: Audiencia[] = [
  {
    id: "aud-1",
    processoId: "proc-1",
    tipo: "conciliacao",
    data: dh(9, 14, 30),
    local: "3ª Vara Cível — Fórum Rodolfo Aureliano, Recife/PE",
    modalidade: "presencial",
    status: "agendada",
    observacoes: "Levar procuração original e documentos de identidade da cliente.",
  },
  {
    id: "aud-2",
    processoId: "proc-3",
    tipo: "justificacao",
    data: dh(16, 10, 0),
    local: "Sala virtual do TJPE",
    modalidade: "virtual",
    link: "https://videoconferencia.tjpe.jus.br/sala/1a-vara-jaboatao",
    status: "agendada",
  },
  {
    id: "aud-3",
    processoId: "proc-4",
    tipo: "outra",
    data: dh(28, 9, 0),
    local: "2ª Vara de Família e Sucessões — Fórum de Olinda/PE",
    modalidade: "hibrida",
    status: "agendada",
    observacoes: "Sessão de tentativa de acordo entre os herdeiros.",
  },
  {
    id: "aud-4",
    processoId: "proc-2",
    tipo: "instrucao",
    data: dh(-1, 15, 0),
    local: "12ª Vara do Trabalho do Recife/PE",
    modalidade: "presencial",
    status: "realizada",
    observacoes: "Duas testemunhas ouvidas. Instrução encerrada.",
  },
  {
    id: "aud-5",
    processoId: "proc-5",
    tipo: "conciliacao",
    data: dh(-25, 11, 0),
    local: "CEJUSC Recife",
    modalidade: "virtual",
    status: "cancelada",
    observacoes: "Cancelada por ausência de citação da parte ré.",
  },
];

export const templatesMensagemMock: TemplateMensagem[] = [
  {
    id: "tmsg-1",
    nome: "Novo andamento",
    texto:
      "Olá, {{cliente}}! Houve um novo andamento no seu processo {{processo}}. Estou acompanhando e aviso assim que houver novidades.",
  },
  {
    id: "tmsg-2",
    nome: "Lembrete de prazo",
    texto:
      "Olá, {{cliente}}! Lembrando que temos um prazo em {{prazo}} no processo {{processo}}. Já estamos preparando a peça.",
  },
  {
    id: "tmsg-3",
    nome: "Convite para audiência",
    texto:
      "Olá, {{cliente}}! Sua audiência foi designada. Confirme sua presença, por favor. Detalhes do processo: {{processo}}.",
  },
  {
    id: "tmsg-4",
    nome: "Solicitação de documentos",
    texto:
      "Olá, {{cliente}}! Para dar andamento ao processo {{processo}}, preciso que me envie alguns documentos. Envio a lista a seguir.",
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
    tipo: "audiencia",
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
  {
    id: "atv-7",
    tipo: "documento",
    texto: "Documento anexado — Comprovante de custas iniciais (Rafael Monteiro Lima).",
    data: d(-4),
  },
];

export const perfilMock = {
  escritorio: "Almeida Advocacia",
  responsavel: "Dra. Ana Almeida",
  oab: "OAB/PE 123.456",
  email: "contato@almeidaadvocacia.adv.br",
  telefone: "(81) 3030-1200",
};

/** Preferências de alerta e comunicação do escritório. */
export const preferenciasMock = {
  alertaPrazoDias: 7,
  notificarWhatsAppAutomatico: true,
  notificarEmailDiario: true,
  contarPrazoEmDiasUteis: true,
  sincronizacaoAutomaticaPje: true,
};

export type Preferencias = typeof preferenciasMock;
