import { dashboardRepository } from "@/server/repositories/dashboardRepository";
import { normalizarPeriodo, obterIntervaloPeriodo } from "@/lib/filtrosPedido";

export const dashboardService = {
  obterResumo(parametros: Record<string, unknown>) {
    const periodo = normalizarPeriodo(parametros.periodo);
    return dashboardRepository.obterResumo(obterIntervaloPeriodo(periodo));
  },
};
