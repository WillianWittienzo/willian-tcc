import {
  FormaPagamento,
  MetodoEntrega,
  NomeBorda,
  NomeTamanho,
  StatusPedido,
  StatusRecebimento,
} from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type CriarPedidoData = {
  clienteId: number | null;
  nomeCliente: string;
  telefone: string;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  referencia: string | null;
  valorTotal: number;
  taxaEntrega: number;
  metodoEntrega: MetodoEntrega;
  formaPagamento: FormaPagamento;
  itens: {
    produtoId: number;
    nomeProduto: string;
    tamanho: NomeTamanho;
    borda: NomeBorda | null;
    precoBorda: number;
    quantidade: number;
    precoUnitario: number;
  }[];
};

const incluirPedido = {
  itens: { orderBy: { id: "asc" as const } },
  recebimento: true,
};

export const pedidoRepository = {
  async listarTodos(filtros: {
    status?: StatusPedido;
    intervalo?: { gte: Date; lt: Date };
    skip: number;
    take: number;
  }) {
    const where = {
      ...(filtros.status ? { status: filtros.status } : {}),
      ...(filtros.intervalo ? { criadoEm: filtros.intervalo } : {}),
    };
    const [total, pedidos, pedidoMaisAntigo] = await prisma.$transaction([
      prisma.pedido.count({ where }),
      prisma.pedido.findMany({
        where,
        include: incluirPedido,
        orderBy: [{ criadoEm: "desc" }, { id: "desc" }],
        skip: filtros.skip,
        take: filtros.take,
      }),
      prisma.pedido.findFirst({ orderBy: { criadoEm: "asc" }, select: { criadoEm: true } }),
    ]);
    return { total, pedidos, pedidoMaisAntigo };
  },
  async listarKanban(intervalo?: { gte: Date; lt: Date }) {
    const where = intervalo ? { criadoEm: intervalo } : {};
    const [pedidos, pedidoMaisAntigo] = await prisma.$transaction([
      prisma.pedido.findMany({
        where,
        include: incluirPedido,
        orderBy: [{ criadoEm: "desc" }, { id: "desc" }],
      }),
      prisma.pedido.findFirst({ orderBy: { criadoEm: "asc" }, select: { criadoEm: true } }),
    ]);
    return { pedidos, pedidoMaisAntigo };
  },
  listarDoCliente(clienteId: number) {
    return prisma.pedido.findMany({ where: { clienteId }, include: incluirPedido, orderBy: [{ criadoEm: "desc" }, { id: "desc" }] });
  },
  buscarDoCliente(id: number, clienteId: number) {
    return prisma.pedido.findFirst({
      where: { id, clienteId },
      include: incluirPedido,
    });
  },
  buscarPorId(id: number) {
    return prisma.pedido.findUnique({ where: { id }, include: incluirPedido });
  },
  buscarProdutosComTamanhos(produtoIds: number[]) {
    return prisma.produto.findMany({ where: { id: { in: produtoIds } }, include: { tamanhos: true } });
  },
  criar(data: CriarPedidoData) {
    return prisma.pedido.create({
      data: {
        clienteId: data.clienteId,
        nomeCliente: data.nomeCliente,
        telefone: data.telefone,
        cep: data.cep,
        rua: data.rua,
        numero: data.numero,
        bairro: data.bairro,
        complemento: data.complemento,
        referencia: data.referencia,
        valorTotal: data.valorTotal,
        taxaEntrega: data.taxaEntrega,
        metodoEntrega: data.metodoEntrega,
        itens: { create: data.itens },
        recebimento: {
          create: {
            valor: data.valorTotal,
            formaPagamento: data.formaPagamento,
          },
        },
      },
      include: incluirPedido,
    });
  },
  atualizarStatusCondicional(id: number, statusAtual: StatusPedido, status: StatusPedido) {
    return prisma.pedido.updateMany({
      where: { id, status: statusAtual },
      data: { status },
    });
  },
  cancelarPendenteDoCliente(id: number, clienteId: number) {
    return prisma.pedido.updateMany({
      where: { id, clienteId, status: StatusPedido.Pendente },
      data: { status: StatusPedido.Cancelado },
    });
  },
  atualizarStatusRecebimento(pedidoId: number, status: StatusRecebimento) {
    return prisma.recebimento.update({
      where: { pedidoId },
      data: { status },
    });
  },
  buscarPublico(id: number, telefone: string) {
    return prisma.pedido.findFirst({
      where: { id, telefone },
      include: incluirPedido,
    });
  },
};
