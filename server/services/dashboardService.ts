import { dashboardRepository } from "@/server/repositories/dashboardRepository";

export const dashboardService = {
  obterResumo() {
    return dashboardRepository.obterResumo();
  },
};
