import { prisma } from "@/lib/prisma";
import { NomeTamanho, StatusPedido } from "@/app/generated/prisma/client";

type CriarPedidoData = {
  valorTotal: number;
  taxaEntrega: number;
  itens: {
    produtoId: number;
    nomeProduto: string;
    tamanho: NomeTamanho;
    quantidade: number;
    precoUnitario: number;
  }[];
};

export const pedidoRepository = {
  async listarTodos() {
    return prisma.pedido.findMany({
      include: {
        itens: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: [{ criadoEm: "desc" }, { id: "desc" }],
    });
  },

  async buscarProdutosComTamanhos(produtoIds: number[]) {
    return prisma.produto.findMany({
      where: {
        id: { in: produtoIds },
      },
      include: {
        tamanhos: true,
      },
    });
  },

  async criar(data: CriarPedidoData) {
    return prisma.pedido.create({
      data: {
        clienteId: null,
        valorTotal: data.valorTotal,
        taxaEntrega: data.taxaEntrega,
        itens: {
          create: data.itens,
        },
      },
      include: {
        itens: true,
      },
    });
  },

  async atualizarStatus(id: number, status: StatusPedido) {
    return prisma.pedido.update({
      where: { id },
      data: { status },
      include: {
        itens: {
          orderBy: { id: "asc" },
        },
      },
    });
  },
};
