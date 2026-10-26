"use client";

import { useCallback, useEffect, useState } from "react";
import {
  atualizarStatusPedido,
  atualizarStatusRecebimento,
  listarPedidosKanban,
  STATUS_PEDIDO,
  type Pedido,
  type StatusPedido,
  type StatusRecebimento,
} from "@/client/pedidoClient";
import { FiltrosData } from "@/components/adm/FiltrosData";
import { PedidoKanbanCard } from "@/components/pedidos/PedidoKanbanCard";
import { ROTULOS_STATUS, type FiltrosDataPedido } from "@/lib/filtrosPedido";

const estilosColuna: Record<StatusPedido, string> = {
  Pendente: "border-amber-400 bg-amber-50/60",
  EmPreparo: "border-orange-400 bg-orange-50/60",
  SaiuParaEntrega: "border-blue-400 bg-blue-50/60",
  Entregue: "border-green-500 bg-green-50/60",
  Cancelado: "border-gray-400 bg-gray-100/70",
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pedidoAtualizando, setPedidoAtualizando] = useState<number | null>(null);
  const [recebimentoAtualizando, setRecebimentoAtualizando] = useState<number | null>(null);
  const [filtrosData, setFiltrosData] = useState<FiltrosDataPedido>({ dia: null, mes: null, ano: null });
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);

  const carregarPedidos = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const resultado = await listarPedidosKanban(filtrosData);
      setPedidos(resultado.pedidos);
      setAnosDisponiveis(resultado.anosDisponiveis);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar os pedidos");
    } finally {
      setCarregando(false);
    }
  }, [filtrosData]);

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

  async function alterarStatus(id: number, status: StatusPedido) {
    setPedidoAtualizando(id);
    setErro("");
    try {
      const atualizado = await atualizarStatusPedido(id, status);
      setPedidos((atuais) => atuais.map((pedido) => pedido.id === id ? atualizado : pedido));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao atualizar status do pedido");
      await carregarPedidos();
    } finally {
      setPedidoAtualizando(null);
    }
  }

  async function alterarRecebimento(id: number, status: StatusRecebimento) {
    setRecebimentoAtualizando(id);
    setErro("");
    try {
      const recebimento = await atualizarStatusRecebimento(id, status);
      setPedidos((atuais) => atuais.map((pedido) =>
        pedido.id === id && pedido.recebimento
          ? { ...pedido, recebimento: { ...pedido.recebimento, ...recebimento } }
          : pedido,
      ));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao atualizar recebimento");
      await carregarPedidos();
    } finally {
      setRecebimentoAtualizando(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">KANBAN DE PEDIDOS</h2>
          <p className="mt-1 text-sm text-gray-500">{pedidos.length} pedido(s) encontrado(s)</p>
        </div>
        <FiltrosData
          filtros={filtrosData}
          anosDisponiveis={anosDisponiveis}
          onChange={setFiltrosData}
        />
      </div>

      {erro && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800" role="alert">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow">
          Carregando pedidos...
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-5 gap-4" style={{ minWidth: 1450 }}>
            {STATUS_PEDIDO.map((status) => {
              const pedidosDaColuna = pedidos.filter((pedido) => pedido.status === status);
              return (
                <section key={status} className={`min-h-80 rounded-xl border-t-4 p-3 ${estilosColuna[status]}`}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="font-bold">{ROTULOS_STATUS[status]}</h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-sm">
                      {pedidosDaColuna.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {pedidosDaColuna.map((pedido) => (
                      <PedidoKanbanCard
                        key={pedido.id}
                        pedido={pedido}
                        atualizando={pedidoAtualizando === pedido.id}
                        recebimentoAtualizando={recebimentoAtualizando === pedido.id}
                        onStatus={(id, novoStatus) => void alterarStatus(id, novoStatus)}
                        onRecebimento={(id, novoStatus) => void alterarRecebimento(id, novoStatus)}
                      />
                    ))}
                    {pedidosDaColuna.length === 0 && (
                      <p className="rounded-lg border border-dashed border-gray-300 bg-white/60 p-4 text-center text-sm text-gray-500">
                        Nenhum pedido
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
