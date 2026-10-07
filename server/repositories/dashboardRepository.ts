import { PapelUsuario, StatusPedido } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { STATUS_EXCLUIDO_RECEITA } from "@/lib/filtrosPedido";

export const dashboardRepository = {
  async obterResumo(intervalo?: { gte: Date; lt: Date }) {
    const filtroPeriodo = intervalo ? { criadoEm: intervalo } : {};
    const [totalPedidos, receita, clientes, produtos] = await Promise.all([
      prisma.pedido.count({ where: filtroPeriodo }),
      prisma.pedido.aggregate({
        where: { ...filtroPeriodo, status: { not: StatusPedido[STATUS_EXCLUIDO_RECEITA] } },
        _sum: { valorTotal: true },
      }),
      prisma.pedido.findMany({
        where: { ...filtroPeriodo, clienteId: { not: null }, cliente: { papel: PapelUsuario.Cliente } },
        distinct: ["clienteId"],
        select: { clienteId: true },
      }),
      prisma.produto.count(),
    ]);
    return { totalPedidos, receita: Number(receita._sum.valorTotal ?? 0), clientes: clientes.length, produtos };
  },
};
