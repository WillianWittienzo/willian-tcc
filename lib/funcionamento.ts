export const FUSO_HORARIO_FUNCIONAMENTO = "America/Sao_Paulo";

export const DIAS_SEMANA = [
  { valor: 0, rotulo: "Domingo" },
  { valor: 1, rotulo: "Segunda-feira" },
  { valor: 2, rotulo: "Terça-feira" },
  { valor: 3, rotulo: "Quarta-feira" },
  { valor: 4, rotulo: "Quinta-feira" },
  { valor: 5, rotulo: "Sexta-feira" },
  { valor: 6, rotulo: "Sábado" },
] as const;

export type HorarioFuncionamento = {
  diaSemana: number;
  fechado: boolean;
  abertura: string;
  fechamento: string;
};

export type ConfiguracaoFuncionamento = {
  fechamentoManual: boolean;
  horarios: HorarioFuncionamento[];
};

export type SituacaoFuncionamento = ConfiguracaoFuncionamento & {
  aberto: boolean;
  mensagem: string;
};

const DIAS_INGLES: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function horarioEmMinutos(horario: string) {
  const [hora, minuto] = horario.split(":").map(Number);
  return hora * 60 + minuto;
}

function partesEmSaoPaulo(agora: Date) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO_HORARIO_FUNCIONAMENTO,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";
  return {
    diaSemana: DIAS_INGLES[valor("weekday")],
    minutos: Number(valor("hour")) * 60 + Number(valor("minute")),
  };
}

function horarioNoturno(horario: HorarioFuncionamento) {
  return horarioEmMinutos(horario.abertura) > horarioEmMinutos(horario.fechamento);
}

export function avaliarFuncionamento(
  configuracao: ConfiguracaoFuncionamento,
  agora = new Date(),
): SituacaoFuncionamento {
  if (configuracao.fechamentoManual) {
    return { ...configuracao, aberto: false, mensagem: "A pizzaria está temporariamente fechada." };
  }

  const { diaSemana, minutos } = partesEmSaoPaulo(agora);
  const horarioAtual = configuracao.horarios.find((horario) => horario.diaSemana === diaSemana);
  if (!horarioAtual || horarioAtual.fechado) {
    return { ...configuracao, aberto: false, mensagem: "A pizzaria está fechada hoje." };
  }

  const abertura = horarioEmMinutos(horarioAtual.abertura);
  const fechamento = horarioEmMinutos(horarioAtual.fechamento);
  const funcionaVinteQuatroHoras = abertura === fechamento;
  const dentroDoHorarioAtual = funcionaVinteQuatroHoras
    || (abertura < fechamento && minutos >= abertura && minutos < fechamento)
    || (abertura > fechamento && minutos >= abertura);

  const diaAnterior = (diaSemana + 6) % 7;
  const horarioAnterior = configuracao.horarios.find((horario) => horario.diaSemana === diaAnterior);
  const continuacaoDoDiaAnterior = Boolean(
    horarioAnterior
      && !horarioAnterior.fechado
      && horarioNoturno(horarioAnterior)
      && minutos < horarioEmMinutos(horarioAnterior.fechamento),
  );

  const aberto = dentroDoHorarioAtual || continuacaoDoDiaAnterior;
  return {
    ...configuracao,
    aberto,
    mensagem: aberto
      ? "A pizzaria está aberta e recebendo pedidos."
      : "A pizzaria está fora do horário de funcionamento.",
  };
}
