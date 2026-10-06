import { dashboardService } from "@/server/services/dashboardService";

export const dashboardController = {
  async obterResumo() {
    try {
      return { status: 200, data: await dashboardService.obterResumo() };
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      return { status: 500, data: { erro: "Erro ao carregar dashboard" } };
    }
  },
};
