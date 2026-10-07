export const STATUS_PEDIDO = [
  "Pendente",
  "EmPreparo",
  "SaiuParaEntrega",
  "Entregue",
  "Cancelado",
] as const;

export type StatusPedido = (typeof STATUS_PEDIDO)[number];
export const STATUS_FILTRO_PEDIDO = ["Todos", ...STATUS_PEDIDO] as const;

export const ROTULOS_STATUS: Record<StatusPedido | "Todos", string> = {
  Todos: "Todos",
  Pendente: "Pendente",
  EmPreparo: "Em preparo",
  SaiuParaEntrega: "Saiu para entrega",
  Entregue: "Entregue",
  Cancelado: "Cancelado",
};

export const PERIODOS_PEDIDO = ["Hoje", "EsteMes", "EsteAno", "Todos"] as const;
export type PeriodoPedido = (typeof PERIODOS_PEDIDO)[number];
export type StatusFiltroPedido = (typeof STATUS_FILTRO_PEDIDO)[number];

export const ROTULOS_PERIODO: Record<PeriodoPedido, string> = {
  Hoje: "Hoje",
  EsteMes: "Este mês",
  EsteAno: "Este ano",
  Todos: "Todos",
};

export const LIMITE_PADRAO_PEDIDOS = 10;
export const LIMITE_MAXIMO_PEDIDOS = 50;
export const FUSO_HORARIO_PEDIDOS = "America/Sao_Paulo";
export const STATUS_EXCLUIDO_RECEITA: StatusPedido = "Cancelado";

export class ParametrosFiltroInvalidosError extends Error {}

type ParametrosBusca = Record<string, unknown>;

function validarValorUnico(valor: unknown, nome: string) {
  if (valor === undefined) return undefined;
  if (typeof valor !== "string") {
    throw new ParametrosFiltroInvalidosError(`Parâmetro ${nome} inválido`);
  }
  return valor;
}

export function normalizarPeriodo(valor: unknown): PeriodoPedido {
  const periodo = validarValorUnico(valor, "periodo") ?? "Todos";
  if (!PERIODOS_PEDIDO.includes(periodo as PeriodoPedido)) {
    throw new ParametrosFiltroInvalidosError("Período inválido");
  }
  return periodo as PeriodoPedido;
}

function normalizarInteiroPositivo(
  valor: unknown,
  nome: string,
  padrao: number,
  maximo?: number,
) {
  const recebido = validarValorUnico(valor, nome);
  if (recebido === undefined) return padrao;
  if (!/^\d+$/.test(recebido)) {
    throw new ParametrosFiltroInvalidosError(`Parâmetro ${nome} inválido`);
  }
  const numero = Number(recebido);
  if (numero < 1 || !Number.isSafeInteger(numero) || (maximo !== undefined && numero > maximo)) {
    throw new ParametrosFiltroInvalidosError(`Parâmetro ${nome} inválido`);
  }
  return numero;
}

export function normalizarFiltrosPedidos(parametros: ParametrosBusca) {
  const statusRecebido = validarValorUnico(parametros.status, "status") ?? "Todos";
  if (statusRecebido !== "Todos" && !STATUS_PEDIDO.includes(statusRecebido as StatusPedido)) {
    throw new ParametrosFiltroInvalidosError("Status inválido");
  }

  return {
    status: statusRecebido as StatusFiltroPedido,
    periodo: normalizarPeriodo(parametros.periodo),
    page: normalizarInteiroPositivo(parametros.page, "page", 1),
    limit: normalizarInteiroPositivo(
      parametros.limit,
      "limit",
      LIMITE_PADRAO_PEDIDOS,
      LIMITE_MAXIMO_PEDIDOS,
    ),
  };
}

export function calcularTotalPaginas(total: number, limite: number) {
  return Math.max(1, Math.ceil(total / limite));
}

const formatadorPartes = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_HORARIO_PEDIDOS,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function partesNoFuso(data: Date) {
  const partes = Object.fromEntries(
    formatadorPartes.formatToParts(data)
      .filter((parte) => parte.type !== "literal")
      .map((parte) => [parte.type, Number(parte.value)]),
  );
  return {
    ano: partes.year,
    mes: partes.month,
    dia: partes.day,
    hora: partes.hour,
    minuto: partes.minute,
    segundo: partes.second,
  };
}

function deslocamentoDoFuso(data: Date) {
  const partes = partesNoFuso(data);
  const horarioComoUtc = Date.UTC(
    partes.ano,
    partes.mes - 1,
    partes.dia,
    partes.hora,
    partes.minuto,
    partes.segundo,
  );
  const instanteSemMilissegundos = Math.floor(data.getTime() / 1000) * 1000;
  return horarioComoUtc - instanteSemMilissegundos;
}

function meiaNoiteLocalEmUtc(ano: number, mes: number, dia: number) {
  const horarioLocalComoUtc = Date.UTC(ano, mes - 1, dia);
  let instante = horarioLocalComoUtc - deslocamentoDoFuso(new Date(horarioLocalComoUtc));
  instante = horarioLocalComoUtc - deslocamentoDoFuso(new Date(instante));
  return new Date(instante);
}

export function obterIntervaloPeriodo(periodo: PeriodoPedido, agora = new Date()) {
  if (periodo === "Todos") return undefined;
  const { ano, mes, dia } = partesNoFuso(agora);

  if (periodo === "Hoje") {
    return {
      gte: meiaNoiteLocalEmUtc(ano, mes, dia),
      lt: meiaNoiteLocalEmUtc(ano, mes, dia + 1),
    };
  }
  if (periodo === "EsteMes") {
    return {
      gte: meiaNoiteLocalEmUtc(ano, mes, 1),
      lt: meiaNoiteLocalEmUtc(ano, mes + 1, 1),
    };
  }
  return {
    gte: meiaNoiteLocalEmUtc(ano, 1, 1),
    lt: meiaNoiteLocalEmUtc(ano + 1, 1, 1),
  };
}
