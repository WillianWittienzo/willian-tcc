import {
  FuncionamentoInvalidoError,
  funcionamentoService,
} from "@/server/services/funcionamentoService";

export const funcionamentoController = {
  async consultar() {
    try {
      return { status: 200, data: await funcionamentoService.consultar() };
    } catch (error) {
      console.error("Erro ao consultar funcionamento:", error);
      return { status: 500, data: { erro: "Não foi possível consultar o funcionamento" } };
    }
  },
  async atualizar(data: unknown) {
    try {
      return { status: 200, data: await funcionamentoService.atualizar(data) };
    } catch (error) {
      if (error instanceof FuncionamentoInvalidoError) {
        return { status: 400, data: { erro: error.message } };
      }
      console.error("Erro ao atualizar funcionamento:", error);
      return { status: 500, data: { erro: "Não foi possível salvar o funcionamento" } };
    }
  },
};
