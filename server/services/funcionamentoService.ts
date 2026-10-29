import {
  avaliarFuncionamento,
  type ConfiguracaoFuncionamento,
  type HorarioFuncionamento,
} from "@/lib/funcionamento";
import { funcionamentoRepository } from "@/server/repositories/funcionamentoRepository";

export class FuncionamentoInvalidoError extends Error {}

const FORMATO_HORARIO = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function formatar(registro: Awaited<ReturnType<typeof funcionamentoRepository.buscar>>): ConfiguracaoFuncionamento {
  return {
    fechamentoManual: registro.configuracao.fechamentoManual,
    horarios: registro.horarios.map(({ diaSemana, fechado, abertura, fechamento }) => ({
      diaSemana,
      fechado,
      abertura,
      fechamento,
    })),
  };
}

function validar(data: unknown): ConfiguracaoFuncionamento {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new FuncionamentoInvalidoError("Configuração de funcionamento inválida");
  }
  const recebido = data as Record<string, unknown>;
  if (typeof recebido.fechamentoManual !== "boolean" || !Array.isArray(recebido.horarios) || recebido.horarios.length !== 7) {
    throw new FuncionamentoInvalidoError("Informe o fechamento manual e os sete dias da semana");
  }

  const horarios = recebido.horarios.map((item): HorarioFuncionamento => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new FuncionamentoInvalidoError("Horário inválido");
    }
    const horario = item as Record<string, unknown>;
    if (!Number.isInteger(horario.diaSemana) || Number(horario.diaSemana) < 0 || Number(horario.diaSemana) > 6) {
      throw new FuncionamentoInvalidoError("Dia da semana inválido");
    }
    if (typeof horario.fechado !== "boolean" || typeof horario.abertura !== "string" || typeof horario.fechamento !== "string"
      || !FORMATO_HORARIO.test(horario.abertura) || !FORMATO_HORARIO.test(horario.fechamento)) {
      throw new FuncionamentoInvalidoError("Use horários válidos no formato HH:mm");
    }
    return {
      diaSemana: Number(horario.diaSemana),
      fechado: horario.fechado,
      abertura: horario.abertura,
      fechamento: horario.fechamento,
    };
  });
  if (new Set(horarios.map((horario) => horario.diaSemana)).size !== 7) {
    throw new FuncionamentoInvalidoError("Cada dia da semana deve aparecer uma única vez");
  }
  return { fechamentoManual: recebido.fechamentoManual, horarios };
}

export const funcionamentoService = {
  async consultar(agora = new Date()) {
    return avaliarFuncionamento(formatar(await funcionamentoRepository.buscar()), agora);
  },
  async atualizar(data: unknown) {
    const configuracao = validar(data);
    return avaliarFuncionamento(formatar(await funcionamentoRepository.atualizar(configuracao)));
  },
};
