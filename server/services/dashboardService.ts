import { dashboardRepository } from "@/server/repositories/dashboardRepository";
import { calcularAnosDisponiveis, normalizarFiltrosData, obterIntervaloData } from "@/lib/filtrosPedido";

export const dashboardService = {
  async obterResumo(parametros: Record<string, unknown>) {
    const filtros = normalizarFiltrosData(parametros);
    const { pedidoMaisAntigo, ...resumo } = await dashboardRepository.obterResumo(
      obterIntervaloData(filtros),
    );
    return {
      ...resumo,
      anosDisponiveis: calcularAnosDisponiveis(pedidoMaisAntigo?.criadoEm ?? null),
    };
  },
};
