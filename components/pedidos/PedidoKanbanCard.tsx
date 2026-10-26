import type { Pedido, StatusPedido, StatusRecebimento } from "@/client/pedidoClient";
import { PedidoCard } from "@/components/pedidos/PedidoCard";
import {
  FUSO_HORARIO_PEDIDOS,
  ROTULOS_STATUS,
  TRANSICOES_STATUS_PEDIDO,
} from "@/lib/filtrosPedido";

type Props = {
  pedido: Pedido;
  atualizando: boolean;
  recebimentoAtualizando: boolean;
  onStatus: (id: number, status: StatusPedido) => void;
  onRecebimento: (id: number, status: StatusRecebimento) => void;
};

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function PedidoKanbanCard({
  pedido,
  atualizando,
  recebimentoAtualizando,
  onStatus,
  onRecebimento,
}: Props) {
  const proximosStatus = TRANSICOES_STATUS_PEDIDO[pedido.status];

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">Pedido #{pedido.id}</h3>
          <p className="text-xs text-gray-500">
            {new Date(pedido.criadoEm).toLocaleString("pt-BR", {
              timeZone: FUSO_HORARIO_PEDIDOS,
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold">
          {ROTULOS_STATUS[pedido.status]}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold">
        {pedido.nomeCliente ?? "Cliente convidado"}
      </p>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
        {pedido.itens.map((item) => (
          <li key={item.id}>{item.quantidade}× {item.nomeProduto} ({item.tamanho})</li>
        ))}
      </ul>

      <dl className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
        <div>
          <dt className="text-gray-500">Total</dt>
          <dd className="font-bold">{moeda.format(pedido.valorTotal)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Atendimento</dt>
          <dd className="font-semibold">{pedido.metodoEntrega === "Retirada" ? "Retirada" : "Entrega"}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Pagamento</dt>
          <dd className="font-semibold">{pedido.recebimento?.formaPagamento ?? "Não registrado"}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Recebimento</dt>
          <dd className="font-semibold">{pedido.recebimento?.status ?? "Não registrado"}</dd>
        </div>
      </dl>

      {proximosStatus.length > 0 && (
        <label className="mt-4 block text-sm font-semibold" htmlFor={`mover-${pedido.id}`}>
          Atualizar status
          <select
            id={`mover-${pedido.id}`}
            value=""
            disabled={atualizando}
            onChange={(event) => onStatus(pedido.id, event.target.value as StatusPedido)}
            className="mt-1 w-full rounded-md border p-2 font-normal disabled:opacity-50"
          >
            <option value="" disabled>{atualizando ? "Atualizando..." : "Mover para..."}</option>
            {proximosStatus.map((status) => (
              <option key={status} value={status}>{ROTULOS_STATUS[status]}</option>
            ))}
          </select>
        </label>
      )}

      <details className="mt-4 border-t pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-red-700">Visualizar detalhes</summary>
        <div className="mt-3">
          <PedidoCard pedido={pedido}>
            {pedido.recebimento && (
              <label className="block border-t pt-4 text-sm font-semibold" htmlFor={`recebimento-${pedido.id}`}>
                Status do recebimento
                <select
                  id={`recebimento-${pedido.id}`}
                  value={pedido.recebimento.status}
                  disabled={recebimentoAtualizando}
                  onChange={(event) => onRecebimento(
                    pedido.id,
                    event.target.value as StatusRecebimento,
                  )}
                  className="mt-2 w-full rounded-md border p-2 font-normal disabled:opacity-50"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                  <option value="Falhou">Falhou</option>
                </select>
              </label>
            )}
          </PedidoCard>
        </div>
      </details>
    </article>
  );
}
