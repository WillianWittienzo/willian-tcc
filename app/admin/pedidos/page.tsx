"use client";

import { useCallback, useEffect, useState } from "react";
import {
  atualizarStatusPedido,
  atualizarStatusRecebimento,
  listarPedidos,
  STATUS_PEDIDO,
  STATUS_RECEBIMENTO,
  type Pedido,
  type StatusPedido,
  type StatusRecebimento,
} from "@/client/pedidoClient";
import { PedidoCard } from "@/components/pedidos/PedidoCard";
import { FiltrosData } from "@/components/adm/FiltrosData";
import {
  ROTULOS_STATUS,
  STATUS_FILTRO_PEDIDO,
  type FiltrosDataPedido,
  type StatusFiltroPedido,
} from "@/lib/filtrosPedido";

const PEDIDOS_POR_PAGINA = 10;

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pedidoAtualizando, setPedidoAtualizando] = useState<number | null>(null);
  const [recebimentoAtualizando, setRecebimentoAtualizando] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusFiltroPedido>("Todos");
  const [filtrosData, setFiltrosData] = useState<FiltrosDataPedido>({ dia: null, mes: null, ano: null });
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const carregarPedidos = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const resultado = await listarPedidos({
        status,
        ...filtrosData,
        page: pagina,
        limit: PEDIDOS_POR_PAGINA,
      });
      if (pagina > resultado.totalPages) {
        setPagina(resultado.totalPages);
        return;
      }
      setPedidos(resultado.pedidos);
      setTotal(resultado.total);
      setTotalPaginas(resultado.totalPages);
      setAnosDisponiveis(resultado.anosDisponiveis);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setErro(error instanceof Error ? error.message : "Não foi possível carregar os pedidos");
    } finally {
      setCarregando(false);
    }
  }, [filtrosData, pagina, status]);

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

  async function alterarStatus(id: number, status: StatusPedido) {
    setPedidoAtualizando(id);

    try {
      await atualizarStatusPedido(id, status);
      await carregarPedidos();
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

  async function alterarRecebimento(id: number, status: StatusRecebimento) {
    setRecebimentoAtualizando(id);
    try {
      await atualizarStatusRecebimento(id, status);
      await carregarPedidos();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao atualizar recebimento");
    } finally {
      setRecebimentoAtualizando(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">GERENCIAR PEDIDOS</h2>
          <p className="mt-1 text-sm text-gray-500">{total} pedido(s) encontrado(s)</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="text-sm font-semibold">
            Status
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFiltroPedido);
                setPagina(1);
              }}
              className="ml-2 rounded-md border bg-white px-3 py-2 font-normal"
            >
              {STATUS_FILTRO_PEDIDO.map((opcao) => (
                <option key={opcao} value={opcao}>{ROTULOS_STATUS[opcao]}</option>
              ))}
            </select>
          </label>
          <FiltrosData
            filtros={filtrosData}
            anosDisponiveis={anosDisponiveis}
            onChange={(novosFiltros) => {
              setFiltrosData(novosFiltros);
              setPagina(1);
            }}
          />
        </div>
      </div>

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
        <div className="grid gap-4 xl:grid-cols-2">
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
                      {ROTULOS_STATUS[status]}
                    </option>
                  ))}
                </select>
                {pedido.recebimento ? (
                  <label htmlFor={`recebimento-${pedido.id}`} className="mt-4 block text-sm font-semibold">
                    Status do recebimento
                    <select
                      id={`recebimento-${pedido.id}`}
                      value={pedido.recebimento.status}
                      disabled={recebimentoAtualizando === pedido.id}
                      onChange={(event) => alterarRecebimento(pedido.id, event.target.value as StatusRecebimento)}
                      className="mt-2 w-full rounded-md border p-2 font-normal disabled:opacity-50"
                    >
                      {STATUS_RECEBIMENTO.map((statusRecebimento) => (
                        <option key={statusRecebimento} value={statusRecebimento}>{statusRecebimento}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">Recebimento histórico não registrado.</p>
                )}
              </div>
            </PedidoCard>
          ))}
        </div>
      )}

      {!carregando && !erro && total > 0 && (
        <nav className="mt-5 flex items-center justify-center gap-4" aria-label="Paginação de pedidos">
          <button
            type="button"
            disabled={pagina === 1}
            onClick={() => setPagina((atual) => Math.max(1, atual - 1))}
            className="rounded-md border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">Página {pagina} de {totalPaginas}</span>
          <button
            type="button"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))}
            className="rounded-md border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima
          </button>
        </nav>
      )}
    </div>
  );
}
