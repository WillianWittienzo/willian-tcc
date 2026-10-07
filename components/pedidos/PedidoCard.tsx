import type { ReactNode } from "react";
import type { Pedido } from "@/client/pedidoClient";
import { FUSO_HORARIO_PEDIDOS, ROTULOS_STATUS } from "@/lib/filtrosPedido";

type PedidoCardProps = {
  pedido: Pedido;
  children?: ReactNode;
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const estiloStatus: Record<Pedido["status"], string> = {
  Pendente: "bg-amber-100 text-amber-800",
  EmPreparo: "bg-orange-100 text-orange-800",
  SaiuParaEntrega: "bg-blue-100 text-blue-800",
  Entregue: "bg-green-100 text-green-800",
  Cancelado: "bg-gray-200 text-gray-700",
};

export function PedidoCard({ pedido, children }: PedidoCardProps) {
  return (
    <article className="space-y-3 rounded-xl bg-white p-4 shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Pedido #{pedido.id}</h3>
          <p className="text-sm text-gray-500">
            {new Date(pedido.criadoEm).toLocaleString("pt-BR", { timeZone: FUSO_HORARIO_PEDIDOS })}
          </p>
        </div>

        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${estiloStatus[pedido.status]}`}>
          {ROTULOS_STATUS[pedido.status]}
        </span>
      </div>

      <div className="divide-y">
        {pedido.itens.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 py-2">
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

      <div className="space-y-1 border-t pt-3">
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
