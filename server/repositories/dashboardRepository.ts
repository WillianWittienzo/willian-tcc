import { PapelUsuario, StatusPedido, StatusRecebimento } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { STATUS_EXCLUIDO_RECEITA } from "@/lib/filtrosPedido";

export const dashboardRepository = {
  async obterResumo(intervalo?: { gte: Date; lt: Date }) {
    const filtroPeriodo = intervalo ? { criadoEm: intervalo } : {};
    const filtroPedidoRecebimento = intervalo ? { pedido: { criadoEm: intervalo } } : {};
    const [totalPedidos, receita, clientesConvidados, clientesAntigos, produtos, pedidoMaisAntigo, recebimentosPendentes, valorRecebido] = await Promise.all([
      prisma.pedido.count({ where: filtroPeriodo }),
      prisma.pedido.aggregate({
        where: { ...filtroPeriodo, status: { not: StatusPedido[STATUS_EXCLUIDO_RECEITA] } },
        _sum: { valorTotal: true },
      }),
      prisma.pedido.findMany({
        where: { ...filtroPeriodo, telefone: { not: null } },
        distinct: ["telefone"],
        select: { telefone: true },
      }),
      prisma.pedido.findMany({
        where: {
          ...filtroPeriodo,
          telefone: null,
          clienteId: { not: null },
          cliente: { papel: PapelUsuario.Cliente },
        },
        distinct: ["clienteId"],
        select: { clienteId: true },
      }),
      prisma.produto.count(),
      prisma.pedido.findFirst({ orderBy: { criadoEm: "asc" }, select: { criadoEm: true } }),
      prisma.recebimento.count({
        where: { ...filtroPedidoRecebimento, status: StatusRecebimento.Pendente },
      }),
      prisma.recebimento.aggregate({
        where: { ...filtroPedidoRecebimento, status: StatusRecebimento.Pago },
        _sum: { valor: true },
      }),
    ]);
    return {
      totalPedidos,
      receita: Number(receita._sum.valorTotal ?? 0),
      clientes: clientesConvidados.length + clientesAntigos.length,
      produtos,
      pedidoMaisAntigo,
      recebimentosPendentes,
      valorRecebido: Number(valorRecebido._sum.valor ?? 0),
    };
  },
};
