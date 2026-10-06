import { ProdutoInvalidoError, ProdutoNaoEncontradoError, produtoService } from "@/server/services/produtoService";

function tratarErro(error: unknown, operacao: string) {
  if (error instanceof ProdutoInvalidoError) return { status: 400, data: { erro: error.message } };
  if (error instanceof ProdutoNaoEncontradoError) return { status: 404, data: { erro: error.message } };
  console.error(`Erro ao ${operacao} produto:`, error);
  return { status: 500, data: { erro: `Erro ao ${operacao} produto` } };
}

export const produtoController = {
  async listarTodos() {
    try {
      return { status: 200, data: await produtoService.listarTodos() };
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      return { status: 500, data: { erro: "Erro ao buscar produtos" } };
    }
  },
  async criar(data: unknown) {
    try { return { status: 201, data: await produtoService.criar(data) }; }
    catch (error) { return tratarErro(error, "cadastrar"); }
  },
  async atualizar(id: number, data: unknown) {
    try { return { status: 200, data: await produtoService.atualizar(id, data) }; }
    catch (error) { return tratarErro(error, "atualizar"); }
  },
  async excluir(id: number) {
    try {
      await produtoService.excluir(id);
      return { status: 200, data: { mensagem: "Produto excluído com sucesso" } };
    } catch (error) { return tratarErro(error, "excluir"); }
  },
};
