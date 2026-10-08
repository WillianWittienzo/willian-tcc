import type { StatusPedido } from "@/lib/filtrosPedido";
import type { MetodoEntrega } from "@/lib/pedido";

export type EtapaAcompanhamento = {
  rotulo: string;
  concluida: boolean;
  atual: boolean;
};

export function criarTimeline(status: StatusPedido, metodo: MetodoEntrega | null) {
  if (status === "Cancelado") {
    return {
      estimativa: "Pedido cancelado",
      cancelado: true,
      etapas: [{ rotulo: "Pedido cancelado", concluida: true, atual: true }],
    };
  }

  if (metodo === null) {
    const indicePorStatus: Record<Exclude<StatusPedido, "Cancelado">, number> = {
      Pendente: 0,
      EmPreparo: 1,
      SaiuParaEntrega: 2,
      Entregue: 3,
    };
    const indiceAtual = indicePorStatus[status];
    const rotulos = ["Pedido recebido", "Em preparação", "Etapa final", "Concluído"];
    return {
      estimativa: "Estimativa indisponível para pedido histórico",
      cancelado: false,
      etapas: rotulos.map((rotulo, indice) => ({
        rotulo,
        concluida: indice <= indiceAtual,
        atual: indice === indiceAtual,
      })),
    };
  }

  const retirada = metodo === "Retirada";
  const rotulos = retirada
    ? ["Pedido recebido", "Em preparação", "Pronto para retirada", "Concluído"]
    : ["Pedido recebido", "Em preparação", "Saiu para entrega", "Entregue"];
  const indicePorStatus: Record<Exclude<StatusPedido, "Cancelado">, number> = {
    Pendente: 0,
    EmPreparo: 1,
    SaiuParaEntrega: 2,
    Entregue: 3,
  };
  const indiceAtual = indicePorStatus[status];

  return {
    estimativa: retirada
      ? "Tempo estimado: aproximadamente 25–40 minutos"
      : "Tempo estimado: aproximadamente 40–60 minutos",
    cancelado: false,
    etapas: rotulos.map((rotulo, indice) => ({
      rotulo,
      concluida: indice <= indiceAtual,
      atual: indice === indiceAtual,
    })),
  };
}
