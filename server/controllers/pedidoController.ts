import {
  PedidoInvalidoError,
  PedidoNaoEncontradoError,
  pedidoService,
} from "@/server/services/pedidoService";
import { ParametrosFiltroInvalidosError } from "@/lib/filtrosPedido";

export const pedidoController = {
  async listarTodos(parametros: Record<string, unknown>) {
    try {
      const pedidos = await pedidoService.listarTodos(parametros);

      return { status: 200, data: pedidos };
    } catch (error) {
      if (error instanceof ParametrosFiltroInvalidosError) {
        return { status: 400, data: { erro: error.message } };
      }
      console.error("Erro ao listar pedidos:", error);

      return {
        status: 500,
        data: { erro: "Erro ao buscar pedidos" },
      };
    }
  },

  async listarDoCliente(clienteId: number) {
    try {
      return {
        status: 200,
        data: await pedidoService.listarDoCliente(clienteId),
      };
    } catch (error) {
      console.error("Erro ao listar pedidos do cliente:", error);
      return { status: 500, data: { erro: "Erro ao buscar seus pedidos" } };
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

  async atualizarStatusRecebimento(id: number, data: unknown) {
    try {
      return { status: 200, data: await pedidoService.atualizarStatusRecebimento(id, data) };
    } catch (error) {
      if (error instanceof PedidoInvalidoError) {
        return { status: 400, data: { erro: error.message } };
      }
      if (error instanceof PedidoNaoEncontradoError) {
        return { status: 404, data: { erro: error.message } };
      }
      console.error("Erro ao atualizar recebimento:", error);
      return { status: 500, data: { erro: "Erro ao atualizar recebimento" } };
    }
  },

  async acompanhar(data: unknown) {
    try {
      return { status: 200, data: await pedidoService.acompanhar(data) };
    } catch (error) {
      if (error instanceof PedidoNaoEncontradoError) {
        return { status: 404, data: { erro: "Pedido não encontrado com os dados informados." } };
      }
      console.error("Erro ao acompanhar pedido:", error);
      return { status: 500, data: { erro: "Não foi possível consultar o pedido." } };
    }
  },
};
