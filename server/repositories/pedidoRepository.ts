import { NomeBorda, NomeTamanho, StatusPedido } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type CriarPedidoData = {
  clienteId: number;
  valorTotal: number;
  taxaEntrega: number;
  itens: {
    produtoId: number;
    nomeProduto: string;
    tamanho: NomeTamanho;
    borda: NomeBorda;
    precoBorda: number;
    quantidade: number;
    precoUnitario: number;
  }[];
};

const incluirItens = { itens: { orderBy: { id: "asc" as const } } };

export const pedidoRepository = {
  listarTodos() {
    return prisma.pedido.findMany({ include: incluirItens, orderBy: [{ criadoEm: "desc" }, { id: "desc" }] });
  },
  listarDoCliente(clienteId: number) {
    return prisma.pedido.findMany({ where: { clienteId }, include: incluirItens, orderBy: [{ criadoEm: "desc" }, { id: "desc" }] });
  },
  buscarProdutosComTamanhos(produtoIds: number[]) {
    return prisma.produto.findMany({ where: { id: { in: produtoIds } }, include: { tamanhos: true } });
  },
  criar(data: CriarPedidoData) {
    return prisma.pedido.create({
      data: {
        clienteId: data.clienteId,
        valorTotal: data.valorTotal,
        taxaEntrega: data.taxaEntrega,
        itens: { create: data.itens },
      },
      include: incluirItens,
    });
  },
  atualizarStatus(id: number, status: StatusPedido) {
    return prisma.pedido.update({ where: { id }, data: { status }, include: incluirItens });
  },
};
