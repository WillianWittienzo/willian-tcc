import { dashboardService } from "@/server/services/dashboardService";
import { ParametrosFiltroInvalidosError } from "@/lib/filtrosPedido";

export const dashboardController = {
  async obterResumo(parametros: Record<string, unknown>) {
    try {
      return { status: 200, data: await dashboardService.obterResumo(parametros) };
    } catch (error) {
      if (error instanceof ParametrosFiltroInvalidosError) {
        return { status: 400, data: { erro: error.message } };
      }
      console.error("Erro ao carregar dashboard:", error);
      return { status: 500, data: { erro: "Erro ao carregar dashboard" } };
    }
  },
};
