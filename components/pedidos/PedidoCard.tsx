import type { ReactNode } from "react";
import type { Pedido } from "@/client/pedidoClient";

type PedidoCardProps = {
  pedido: Pedido;
  children?: ReactNode;
};

const rotulosStatus = {
  Pendente: "Pendente",
  EmPreparo: "Em preparo",
  SaiuParaEntrega: "Saiu para entrega",
  Entregue: "Entregue",
  Cancelado: "Cancelado",
} as const;

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function PedidoCard({ pedido, children }: PedidoCardProps) {
  return (
    <article className="bg-white p-6 rounded-xl shadow space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Pedido #{pedido.id}</h3>
          <p className="text-sm text-gray-500">
            {new Date(pedido.criadoEm).toLocaleString("pt-BR")}
          </p>
        </div>

        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
          {rotulosStatus[pedido.status]}
        </span>
      </div>

      <div className="divide-y">
        {pedido.itens.map((item) => (
          <div key={item.id} className="py-3 flex justify-between gap-4">
            <div>
              <p className="font-semibold">{item.nomeProduto}</p>
              <p className="text-sm text-gray-500">
                {item.tamanho} · {item.quantidade} unidade(s)
              </p>
              {item.borda && (
                <p className="text-sm text-gray-500">
                  Borda: {item.borda} (+{moeda.format(item.precoBorda)})
                </p>
              )}
            </div>
            <div className="text-right text-sm">
              <p>{moeda.format(item.precoUnitario)} {item.borda ? "+ borda" : "cada"}</p>
              <p className="font-semibold">
                {moeda.format((item.precoUnitario + item.precoBorda) * item.quantidade)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Taxa de entrega</span>
          <span>{moeda.format(pedido.taxaEntrega)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{moeda.format(pedido.valorTotal)}</span>
        </div>
      </div>

      {children}
    </article>
  );
}
