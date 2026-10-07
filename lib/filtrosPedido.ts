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

export type StatusFiltroPedido = (typeof STATUS_FILTRO_PEDIDO)[number];

export type FiltrosDataPedido = {
  dia: number | null;
  mes: number | null;
  ano: number | null;
};

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

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

function normalizarParteData(
  valor: unknown,
  nome: string,
  minimo: number,
  maximo: number,
) {
  const recebido = validarValorUnico(valor, nome);
  if (recebido === undefined || recebido === "" || recebido === "Todos") return null;
  if (!/^\d+$/.test(recebido)) {
    throw new ParametrosFiltroInvalidosError(`Parâmetro ${nome} inválido`);
  }
  const numero = Number(recebido);
  if (!Number.isSafeInteger(numero) || numero < minimo || numero > maximo) {
    throw new ParametrosFiltroInvalidosError(`Parâmetro ${nome} inválido`);
  }
  return numero;
}

export function normalizarFiltrosData(parametros: ParametrosBusca): FiltrosDataPedido {
  const anoAtual = partesNoFuso(new Date()).ano;
  const dia = normalizarParteData(parametros.dia, "dia", 1, 31);
  const mes = normalizarParteData(parametros.mes, "mes", 1, 12);
  const ano = normalizarParteData(parametros.ano, "ano", 2000, anoAtual + 1);

  if (dia !== null && (mes === null || ano === null)) {
    throw new ParametrosFiltroInvalidosError("Dia exige mês e ano");
  }
  if (mes !== null && ano === null) {
    throw new ParametrosFiltroInvalidosError("Mês exige ano");
  }
  if (dia !== null) {
    const data = new Date(Date.UTC(ano!, mes! - 1, dia));
    if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes! - 1 || data.getUTCDate() !== dia) {
      throw new ParametrosFiltroInvalidosError("Data inválida");
    }
  }
  return { dia, mes, ano };
}

export function normalizarFiltrosPedidos(parametros: ParametrosBusca) {
  const statusRecebido = validarValorUnico(parametros.status, "status") ?? "Todos";
  if (statusRecebido !== "Todos" && !STATUS_PEDIDO.includes(statusRecebido as StatusPedido)) {
    throw new ParametrosFiltroInvalidosError("Status inválido");
  }

  return {
    status: statusRecebido as StatusFiltroPedido,
    ...normalizarFiltrosData(parametros),
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

export function obterIntervaloData(filtros: FiltrosDataPedido) {
  if (filtros.ano === null) return undefined;
  if (filtros.dia !== null) {
    return {
      gte: meiaNoiteLocalEmUtc(filtros.ano, filtros.mes!, filtros.dia),
      lt: meiaNoiteLocalEmUtc(filtros.ano, filtros.mes!, filtros.dia + 1),
    };
  }
  if (filtros.mes !== null) {
    return {
      gte: meiaNoiteLocalEmUtc(filtros.ano, filtros.mes, 1),
      lt: meiaNoiteLocalEmUtc(filtros.ano, filtros.mes + 1, 1),
    };
  }
  return {
    gte: meiaNoiteLocalEmUtc(filtros.ano, 1, 1),
    lt: meiaNoiteLocalEmUtc(filtros.ano + 1, 1, 1),
  };
}

export function calcularAnosDisponiveis(dataMaisAntiga: Date | null, agora = new Date()) {
  const anoAtual = partesNoFuso(agora).ano;
  const primeiroAno = dataMaisAntiga
    ? Math.min(partesNoFuso(dataMaisAntiga).ano, anoAtual)
    : anoAtual;
  return Array.from(
    { length: anoAtual - primeiroAno + 1 },
    (_, indice) => anoAtual - indice,
  );
}
