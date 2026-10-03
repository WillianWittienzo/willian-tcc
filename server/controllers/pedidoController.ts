import {
  PedidoInvalidoError,
  PedidoNaoEncontradoError,
  pedidoService,
} from "@/server/services/pedidoService";

export const pedidoController = {
  async listarTodos() {
    try {
      const pedidos = await pedidoService.listarTodos();

      return { status: 200, data: pedidos };
    } catch (error) {
      console.error("Erro ao listar pedidos:", error);

      return {
        status: 500,
        data: { erro: "Erro ao buscar pedidos" },
      };
    }
  },

  async criar(data: unknown) {
    try {
      const pedido = await pedidoService.criar(data);

      return {
        status: 201,
        data: pedido,
      };
    } catch (error) {
      if (error instanceof PedidoInvalidoError) {
        return {
          status: 400,
          data: { erro: error.message },
        };
      }

      console.error("Erro ao criar pedido:", error);

      return {
        status: 500,
        data: { erro: "Erro ao criar pedido" },
      };
    }
  },

  async atualizarStatus(id: number, data: unknown) {
    try {
      const pedido = await pedidoService.atualizarStatus(id, data);

      return { status: 200, data: pedido };
    } catch (error) {
      if (error instanceof PedidoInvalidoError) {
        return { status: 400, data: { erro: error.message } };
      }

      if (error instanceof PedidoNaoEncontradoError) {
        return { status: 404, data: { erro: error.message } };
      }

      console.error("Erro ao atualizar status do pedido:", error);

      return {
        status: 500,
        data: { erro: "Erro ao atualizar status do pedido" },
      };
    }
  },
};
