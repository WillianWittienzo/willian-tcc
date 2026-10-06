import { PapelUsuario, StatusPedido } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const dashboardRepository = {
  async obterResumo() {
    const [totalPedidos, receita, clientes, produtos] = await Promise.all([
      prisma.pedido.count(),
      prisma.pedido.aggregate({
        where: { status: { not: StatusPedido.Cancelado } },
        _sum: { valorTotal: true },
      }),
      prisma.usuario.count({ where: { papel: PapelUsuario.Cliente } }),
      prisma.produto.count(),
    ]);
    return { totalPedidos, receita: Number(receita._sum.valorTotal ?? 0), clientes, produtos };
  },
};
