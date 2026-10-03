import { NomeTamanho, StatusPedido } from "@/app/generated/prisma/client";
import { pedidoRepository } from "@/server/repositories/pedidoRepository";

const TAXA_ENTREGA_EM_CENTAVOS = 800;
const TAMANHOS_VALIDOS = ["Pequena", "Média", "Grande"] as const;

type TamanhoPedido = (typeof TAMANHOS_VALIDOS)[number];

type ItemRecebido = {
  produtoId: number;
  tamanho: TamanhoPedido;
  quantidade: number;
};

export class PedidoInvalidoError extends Error {}
export class PedidoNaoEncontradoError extends Error {}

type PedidoPersistido = Awaited<ReturnType<typeof pedidoRepository.criar>>;

function formatarPedido(pedido: PedidoPersistido) {
  return {
    id: pedido.id,
    clienteId: pedido.clienteId,
    valorTotal: Number(pedido.valorTotal),
    taxaEntrega: Number(pedido.taxaEntrega),
    status: pedido.status,
    criadoEm: pedido.criadoEm,
    itens: pedido.itens.map((item) => ({
      id: item.id,
      produtoId: item.produtoId,
      nomeProduto: item.nomeProduto,
      tamanho: item.tamanho === "Media" ? "Média" : item.tamanho,
      quantidade: item.quantidade,
      precoUnitario: Number(item.precoUnitario),
    })),
  };
}

function validarItens(data: unknown): ItemRecebido[] {
  if (
    typeof data !== "object" ||
    data === null ||
    !("itens" in data) ||
    !Array.isArray(data.itens) ||
    data.itens.length === 0
  ) {
    throw new PedidoInvalidoError("O pedido deve possuir ao menos um item");
  }

  return data.itens.map((item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      !("produtoId" in item) ||
      !Number.isInteger(item.produtoId) ||
      Number(item.produtoId) <= 0 ||
      !("quantidade" in item) ||
      !Number.isInteger(item.quantidade) ||
      Number(item.quantidade) <= 0 ||
      !("tamanho" in item) ||
      !TAMANHOS_VALIDOS.includes(item.tamanho as TamanhoPedido)
    ) {
      throw new PedidoInvalidoError("Item do pedido inválido");
    }

    return {
      produtoId: Number(item.produtoId),
      tamanho: item.tamanho as TamanhoPedido,
      quantidade: Number(item.quantidade),
    };
  });
}

function converterTamanho(tamanho: TamanhoPedido) {
  return tamanho === "Média" ? NomeTamanho.Media : NomeTamanho[tamanho];
}

function obterStatus(data: unknown) {
  if (
    typeof data !== "object" ||
    data === null ||
    !("status" in data) ||
    typeof data.status !== "string" ||
    !Object.values(StatusPedido).includes(data.status as StatusPedido)
  ) {
    throw new PedidoInvalidoError("Status do pedido inválido");
  }

  return data.status as StatusPedido;
}

function registroNaoEncontrado(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}

export const pedidoService = {
  async listarTodos() {
    const pedidos = await pedidoRepository.listarTodos();
    return pedidos.map(formatarPedido);
  },

  async criar(data: unknown) {
    const itensRecebidos = validarItens(data);
    const produtoIds = [...new Set(itensRecebidos.map((item) => item.produtoId))];
    const produtos = await pedidoRepository.buscarProdutosComTamanhos(produtoIds);
    const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));

    let subtotalEmCentavos = 0;

    const itens = itensRecebidos.map((item) => {
      const produto = produtosPorId.get(item.produtoId);

      if (!produto) {
        throw new PedidoInvalidoError(
          `Produto ${item.produtoId} não encontrado`
        );
      }

      const tamanho = converterTamanho(item.tamanho);
      const produtoTamanho = produto.tamanhos.find(
        (opcao) => opcao.nome === tamanho
      );

      if (!produtoTamanho) {
        throw new PedidoInvalidoError(
          `Tamanho ${item.tamanho} indisponível para ${produto.nome}`
        );
      }

      const precoEmCentavos = Math.round(Number(produtoTamanho.preco) * 100);
      subtotalEmCentavos += precoEmCentavos * item.quantidade;

      return {
        produtoId: produto.id,
        nomeProduto: produto.nome,
        tamanho,
        quantidade: item.quantidade,
        precoUnitario: precoEmCentavos / 100,
      };
    });

    const pedido = await pedidoRepository.criar({
      taxaEntrega: TAXA_ENTREGA_EM_CENTAVOS / 100,
      valorTotal:
        (subtotalEmCentavos + TAXA_ENTREGA_EM_CENTAVOS) / 100,
      itens,
    });

    return formatarPedido(pedido);
  },

  async atualizarStatus(id: number, data: unknown) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new PedidoInvalidoError("ID do pedido inválido");
    }

    const status = obterStatus(data);

    try {
      const pedido = await pedidoRepository.atualizarStatus(id, status);
      return formatarPedido(pedido);
    } catch (error) {
      if (registroNaoEncontrado(error)) {
        throw new PedidoNaoEncontradoError("Pedido não encontrado");
      }

      throw error;
    }
  },
};
