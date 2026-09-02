/**
 * Contagem de prazos processuais segundo o CPC.
 *
 * - Art. 219: prazos em dias contam-se apenas em DIAS ÚTEIS.
 * - Art. 224: exclui-se o dia do começo e inclui-se o dia do vencimento;
 *   o início só ocorre em dia útil.
 * - Art. 220: suspensão entre 20/12 e 20/01 (recesso forense).
 *
 * Tudo aqui é puro e determinístico — sem dependência de rede — para que o
 * cálculo possa ser auditado e testado.
 */

const MS_DIA = 86_400_000;

/** Normaliza para meio-dia local, evitando ruído de fuso/horário de verão. */
function meioDia(data: Date | string): Date {
  const d = typeof data === "string" ? new Date(data) : new Date(data);
  d.setHours(12, 0, 0, 0);
  return d;
}

function chave(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Domingo de Páscoa pelo algoritmo de Meeus/Jones/Butcher (calendário gregoriano).
 * Base para Carnaval, Sexta-feira Santa e Corpus Christi.
 */
function domingoDePascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia, 12, 0, 0, 0);
}

function somarDiasCorridos(data: Date, dias: number): Date {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}

export type Feriado = { data: string; nome: string; tipo: "nacional" | "forense" };

/**
 * Feriados nacionais + datas de suspensão de expediente forense (Lei 5.010/66,
 * art. 62, aplicada de forma ampla pelos tribunais).
 */
export function feriadosDoAno(ano: number): Feriado[] {
  const pascoa = domingoDePascoa(ano);

  const fixos: Array<[number, number, string]> = [
    [0, 1, "Confraternização Universal"],
    [3, 21, "Tiradentes"],
    [4, 1, "Dia do Trabalho"],
    [8, 7, "Independência do Brasil"],
    [9, 12, "Nossa Senhora Aparecida"],
    [10, 2, "Finados"],
    [10, 15, "Proclamação da República"],
    [11, 25, "Natal"],
  ];

  const feriados: Feriado[] = fixos.map(([mes, dia, nome]) => ({
    data: chave(new Date(ano, mes, dia, 12)),
    nome,
    tipo: "nacional",
  }));

  const moveis: Array<[Date, string, Feriado["tipo"]]> = [
    [somarDiasCorridos(pascoa, -48), "Carnaval (segunda-feira)", "forense"],
    [somarDiasCorridos(pascoa, -47), "Carnaval (terça-feira)", "nacional"],
    [somarDiasCorridos(pascoa, -46), "Quarta-feira de Cinzas", "forense"],
    [somarDiasCorridos(pascoa, -2), "Sexta-feira Santa", "nacional"],
    [somarDiasCorridos(pascoa, 60), "Corpus Christi", "forense"],
  ];

  for (const [data, nome, tipo] of moveis) {
    feriados.push({ data: chave(data), nome, tipo });
  }

  // Datas de suspensão do expediente forense reconhecidas nacionalmente.
  feriados.push(
    { data: chave(new Date(ano, 0, 31, 12)), nome: "Dia da Justiça Federal", tipo: "forense" },
    { data: chave(new Date(ano, 7, 11, 12)), nome: "Dia do Advogado", tipo: "forense" },
    { data: chave(new Date(ano, 11, 8, 12)), nome: "Dia da Justiça", tipo: "forense" },
  );

  return feriados;
}

const cacheFeriados = new Map<number, Map<string, Feriado>>();

function mapaFeriados(ano: number): Map<string, Feriado> {
  let mapa = cacheFeriados.get(ano);
  if (!mapa) {
    mapa = new Map(feriadosDoAno(ano).map((f) => [f.data, f]));
    cacheFeriados.set(ano, mapa);
  }
  return mapa;
}

/** Recesso forense do CPC art. 220: 20/12 a 20/01, inclusive. */
export function emRecessoForense(data: Date | string): boolean {
  const d = meioDia(data);
  const mes = d.getMonth();
  const dia = d.getDate();
  return (mes === 11 && dia >= 20) || (mes === 0 && dia <= 20);
}

export function feriadoDe(data: Date | string): Feriado | undefined {
  const d = meioDia(data);
  return mapaFeriados(d.getFullYear()).get(chave(d));
}

export function isFimDeSemana(data: Date | string): boolean {
  const dia = meioDia(data).getDay();
  return dia === 0 || dia === 6;
}

/** Dia em que há expediente forense: útil, sem feriado e fora do recesso. */
export function isDiaUtilForense(data: Date | string): boolean {
  const d = meioDia(data);
  return !isFimDeSemana(d) && !feriadoDe(d) && !emRecessoForense(d);
}

/** Motivo pelo qual uma data não é dia útil — usado para explicar o cálculo. */
export function motivoNaoUtil(data: Date | string): string | null {
  const d = meioDia(data);
  if (isFimDeSemana(d)) return d.getDay() === 0 ? "Domingo" : "Sábado";
  const feriado = feriadoDe(d);
  if (feriado) return feriado.nome;
  if (emRecessoForense(d)) return "Recesso forense (CPC art. 220)";
  return null;
}

/** Próximo dia com expediente, a partir de (e incluindo) a data informada. */
export function proximoDiaUtil(data: Date | string): Date {
  let d = meioDia(data);
  let guarda = 0;
  while (!isDiaUtilForense(d) && guarda < 400) {
    d = somarDiasCorridos(d, 1);
    guarda++;
  }
  return d;
}

/**
 * Vencimento de um prazo processual: exclui o dia do começo, conta apenas dias
 * úteis e prorroga o vencimento que cair em dia sem expediente (CPC art. 224).
 */
export function calcularVencimento(inicio: Date | string, diasUteis: number): Date {
  // O prazo só começa a correr no primeiro dia útil seguinte à intimação.
  let cursor = proximoDiaUtil(somarDiasCorridos(meioDia(inicio), 1));
  let contados = 1;

  while (contados < diasUteis) {
    cursor = proximoDiaUtil(somarDiasCorridos(cursor, 1));
    contados++;
  }

  return cursor;
}

/**
 * Dias úteis restantes até a data-alvo (negativo se já passou).
 * É a métrica que o advogado realmente usa para saber quanto tempo tem.
 */
export function diasUteisAte(alvo: Date | string): number {
  const fim = meioDia(alvo);
  const hoje = meioDia(new Date());

  if (chave(fim) === chave(hoje)) return 0;

  const futuro = fim.getTime() > hoje.getTime();
  const [de, ate] = futuro ? [hoje, fim] : [fim, hoje];

  let contador = 0;
  let cursor = somarDiasCorridos(de, 1);

  while (cursor.getTime() <= ate.getTime()) {
    if (isDiaUtilForense(cursor)) contador++;
    cursor = somarDiasCorridos(cursor, 1);
  }

  return futuro ? contador : -contador;
}

export function diasCorridosAte(alvo: Date | string): number {
  const fim = meioDia(alvo);
  const hoje = meioDia(new Date());
  return Math.round((fim.getTime() - hoje.getTime()) / MS_DIA);
}

/** Texto curto no formato que advogado lê: "faltam 3 dias úteis". */
export function prazoUtilRelativo(alvo: Date | string): string {
  const dias = diasUteisAte(alvo);
  if (dias === 0) return "vence hoje";
  if (dias === 1) return "1 dia útil";
  if (dias > 1) return `${dias} dias úteis`;
  if (dias === -1) return "venceu há 1 dia útil";
  return `venceu há ${Math.abs(dias)} dias úteis`;
}

/** Prazos legais mais usados no dia a dia, para o cálculo assistido. */
export const prazosComuns = [
  { label: "Contestação (15 dias úteis)", dias: 15 },
  { label: "Réplica (15 dias úteis)", dias: 15 },
  { label: "Apelação (15 dias úteis)", dias: 15 },
  { label: "Embargos de declaração (5 dias úteis)", dias: 5 },
  { label: "Agravo de instrumento (15 dias úteis)", dias: 15 },
  { label: "Contrarrazões (15 dias úteis)", dias: 15 },
  { label: "Manifestação simples (5 dias úteis)", dias: 5 },
  { label: "Impugnação ao cumprimento (15 dias úteis)", dias: 15 },
] as const;
