import { produtoService } from "@/server/services/produtoService";

export const produtoController = {
  async listarTodos() {
    try {
      const produtos = await produtoService.listarTodos();

      return {
        status: 200,
        data: produtos,
      };
    } catch (error) {
      console.error("Erro ao listar produtos:", error);

      return {
        status: 500,
        data: {
          erro: "Erro ao buscar produtos",
        },
      };
    }
  },

  async criar(data: any) {
    try {
      const produto = await produtoService.criar(data);

      return {
        status: 201,
        data: produto,
      };
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);

      return {
        status: 500,
        data: {
          erro: "Erro ao cadastrar produto",
        },
      };
    }
  },

  async excluir(id: number) {
    try {
      await produtoService.excluir(id);

      return {
        status: 200,
        data: {
          mensagem: "Produto excluído com sucesso",
        },
      };
    } catch (error) {
      console.error("Erro ao excluir produto:", error);

      return {
        status: 500,
        data: {
          erro: "Erro ao excluir produto",
        },
      };
    }
  },

};