"use client";

import { useEffect, useState } from "react";
import {
  atualizarStatusPedido,
  listarPedidos,
  STATUS_PEDIDO,
  type Pedido,
  type StatusPedido,
} from "@/client/pedidoClient";
import { PedidoCard } from "@/components/pedidos/PedidoCard";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pedidoAtualizando, setPedidoAtualizando] = useState<number | null>(null);

  useEffect(() => {
    async function carregarPedidos() {
      try {
        setPedidos(await listarPedidos());
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        setErro("Não foi possível carregar os pedidos");
      } finally {
        setCarregando(false);
      }
    }

    carregarPedidos();
  }, []);

  async function alterarStatus(id: number, status: StatusPedido) {
    setPedidoAtualizando(id);

    try {
      const pedidoAtualizado = await atualizarStatusPedido(id, status);
      setPedidos((atuais) =>
        atuais.map((pedido) =>
          pedido.id === id ? pedidoAtualizado : pedido
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status do pedido"
      );
    } finally {
      setPedidoAtualizando(null);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">GERENCIAR PEDIDOS</h2>

      {carregando && (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
          Carregando pedidos...
        </div>
      )}

      {!carregando && erro && (
        <div className="bg-white p-6 rounded-xl shadow text-center text-red-700">
          {erro}
        </div>
      )}

      {!carregando && !erro && pedidos.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-center">Nenhum pedido encontrado</p>
        </div>
      )}

      {!carregando && !erro && pedidos.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-2">
          {pedidos.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido}>
              <div className="border-t pt-4">
                <label
                  htmlFor={`status-${pedido.id}`}
                  className="block text-sm font-semibold mb-2"
                >
                  Alterar status
                </label>
                <select
                  id={`status-${pedido.id}`}
                  value={pedido.status}
                  disabled={pedidoAtualizando === pedido.id}
                  onChange={(event) =>
                    alterarStatus(
                      pedido.id,
                      event.target.value as StatusPedido
                    )
                  }
                  className="w-full border p-2 rounded-md disabled:opacity-50"
                >
                  {STATUS_PEDIDO.map((status) => (
                    <option key={status} value={status}>
                      {status === "EmPreparo"
                        ? "Em preparo"
                        : status === "SaiuParaEntrega"
                          ? "Saiu para entrega"
                          : status}
                    </option>
                  ))}
                </select>
              </div>
            </PedidoCard>
          ))}
        </div>
      )}
    </div>
  );
}
