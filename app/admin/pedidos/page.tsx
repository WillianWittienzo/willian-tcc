"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  ROTULOS_STATUS,
  TRANSICOES_STATUS_PEDIDO,
  obterDataAtualNoFuso,
  type FiltrosDataPedido,
} from "@/lib/filtrosPedido";

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
  const [pedidoArrastado, setPedidoArrastado] = useState<number | null>(null);
  const [colunaDestino, setColunaDestino] = useState<StatusPedido | null>(null);
  const [recebimentoAtualizando, setRecebimentoAtualizando] = useState<number | null>(null);
  const [filtrosData, setFiltrosData] = useState<FiltrosDataPedido | null>(null);
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const [notificacaoNovos, setNotificacaoNovos] = useState(0);
  const [buscaPedido, setBuscaPedido] = useState("");
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState<number | null>(null);
  const [erroCancelamento, setErroCancelamento] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const operacaoEmAndamento = useRef(false);
  const consultaEmAndamento = useRef(false);
  const consultaAtual = useRef<AbortController | null>(null);
  const primeiraConsulta = useRef(true);
  const idsConhecidos = useRef<Set<number>>(new Set());

  const carregarPedidos = useCallback(async (silencioso = false) => {
    if (filtrosData === null) return;
    if (consultaEmAndamento.current || operacaoEmAndamento.current) return;
    consultaEmAndamento.current = true;
    const controller = new AbortController();
    consultaAtual.current = controller;
    if (!silencioso) {
      setCarregando(true);
      setErro("");
    }
    try {
      const resultado = await listarPedidosKanban(filtrosData, controller.signal);
      if (controller.signal.aborted) return;
      const novos = primeiraConsulta.current
        ? []
        : resultado.pedidos.filter((pedido) => !idsConhecidos.current.has(pedido.id));
      idsConhecidos.current = new Set(resultado.pedidos.map((pedido) => pedido.id));
      primeiraConsulta.current = false;
      setPedidos(resultado.pedidos);
      setAnosDisponiveis(resultado.anosDisponiveis);
      if (novos.length > 0) {
        setNotificacaoNovos(novos.length);
      }
    } catch (error) {
      if (!silencioso && !(error instanceof DOMException && error.name === "AbortError")) {
        setErro(error instanceof Error ? error.message : "Não foi possível carregar os pedidos");
      }
    } finally {
      if (consultaAtual.current === controller) {
        consultaEmAndamento.current = false;
        consultaAtual.current = null;
        if (!silencioso) setCarregando(false);
      }
    }
  }, [filtrosData]);

  useEffect(() => {
    const dataAtual = obterDataAtualNoFuso();
    const timer = window.setTimeout(() => {
      setAnosDisponiveis(dataAtual.ano === null ? [] : [dataAtual.ano]);
      setFiltrosData(dataAtual);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (filtrosData === null) return;
    consultaAtual.current?.abort();
    consultaEmAndamento.current = false;
    primeiraConsulta.current = true;
    idsConhecidos.current.clear();
    const timer = window.setTimeout(() => void carregarPedidos(), 0);
    return () => {
      window.clearTimeout(timer);
      consultaAtual.current?.abort();
      consultaAtual.current = null;
      consultaEmAndamento.current = false;
    };
  }, [carregarPedidos, filtrosData]);

  useEffect(() => {
    function atualizarSeVisivel() {
      if (document.visibilityState === "visible") void carregarPedidos(true);
    }
    const intervalo = window.setInterval(atualizarSeVisivel, 15_000);
    document.addEventListener("visibilitychange", atualizarSeVisivel);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", atualizarSeVisivel);
    };
  }, [carregarPedidos]);

  useEffect(() => {
    if (notificacaoNovos === 0) return;
    const timer = window.setTimeout(() => setNotificacaoNovos(0), 6_000);
    return () => window.clearTimeout(timer);
  }, [notificacaoNovos]);

  useEffect(() => {
    if (!mensagemSucesso) return;
    const timer = window.setTimeout(() => setMensagemSucesso(""), 6_000);
    return () => window.clearTimeout(timer);
  }, [mensagemSucesso]);

  useEffect(() => {
    if (pedidoParaCancelar === null) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && pedidoAtualizando === null) {
        setPedidoParaCancelar(null);
        setErroCancelamento("");
      }
    }
    window.addEventListener("keydown", fecharComEscape);
    return () => {
      window.removeEventListener("keydown", fecharComEscape);
      document.body.style.overflow = overflowAnterior;
    };
  }, [pedidoAtualizando, pedidoParaCancelar]);

  async function alterarStatus(id: number, status: StatusPedido) {
    if (operacaoEmAndamento.current) return false;
    const pedidoOriginal = pedidos.find((pedido) => pedido.id === id);
    if (!pedidoOriginal || !TRANSICOES_STATUS_PEDIDO[pedidoOriginal.status].includes(status)) {
      if (status === "Cancelado") setErroCancelamento("Este pedido não pode mais ser cancelado.");
      return false;
    }

    operacaoEmAndamento.current = true;
    consultaAtual.current?.abort();
    consultaAtual.current = null;
    consultaEmAndamento.current = false;
    setPedidoAtualizando(id);
    setErro("");
    try {
      const atualizado = await atualizarStatusPedido(id, status);
      setPedidos((atuais) => atuais.map((pedido) => pedido.id === id ? atualizado : pedido));
      return true;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao atualizar status do pedido";
      setErro(`${mensagem} O cartão permaneceu na coluna original.`);
      if (status === "Cancelado") setErroCancelamento(`${mensagem} O pedido não foi cancelado.`);
      return false;
    } finally {
      operacaoEmAndamento.current = false;
      setPedidoAtualizando(null);
      setPedidoArrastado(null);
      setColunaDestino(null);
    }
  }

  function iniciarArraste(id: number, event: React.DragEvent<HTMLElement>) {
    if (operacaoEmAndamento.current) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(id));
    setPedidoArrastado(id);
  }

  function podeMoverPara(status: StatusPedido) {
    const pedido = pedidos.find((item) => item.id === pedidoArrastado);
    return Boolean(pedido && TRANSICOES_STATUS_PEDIDO[pedido.status].includes(status));
  }

  function soltarNaColuna(status: StatusPedido) {
    if (pedidoArrastado !== null && podeMoverPara(status)) {
      if (status === "Cancelado") {
        setPedidoParaCancelar(pedidoArrastado);
        setErroCancelamento("");
        setPedidoArrastado(null);
        setColunaDestino(null);
        return;
      }
      void alterarStatus(pedidoArrastado, status);
      return;
    }
    setPedidoArrastado(null);
    setColunaDestino(null);
  }

  async function confirmarCancelamento() {
    if (pedidoParaCancelar === null || operacaoEmAndamento.current) return;
    const id = pedidoParaCancelar;
    setErroCancelamento("");
    if (await alterarStatus(id, "Cancelado")) {
      setPedidoParaCancelar(null);
      setMensagemSucesso(`Pedido #${id} cancelado com sucesso.`);
    }
  }

  function fecharConfirmacaoCancelamento() {
    if (pedidoAtualizando !== null) return;
    setPedidoParaCancelar(null);
    setErroCancelamento("");
  }

  async function alterarRecebimento(id: number, status: StatusRecebimento) {
    if (operacaoEmAndamento.current) return;
    operacaoEmAndamento.current = true;
    consultaAtual.current?.abort();
    consultaAtual.current = null;
    consultaEmAndamento.current = false;
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
    } finally {
      operacaoEmAndamento.current = false;
      setRecebimentoAtualizando(null);
    }
  }

  const pedidosVisiveis = buscaPedido
    ? pedidos.filter((pedido) => String(pedido.id).includes(buscaPedido))
    : pedidos;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">KANBAN DE PEDIDOS</h2>
          <p className="mt-1 text-sm text-gray-500">{pedidosVisiveis.length} pedido(s) exibido(s)</p>
          <p className="mt-1 text-xs text-gray-500">Arraste os cartões entre as colunas para atualizar o status.</p>
        </div>
        {filtrosData && (
          <FiltrosData
            filtros={filtrosData}
            anosDisponiveis={anosDisponiveis}
            onChange={setFiltrosData}
          />
        )}
      </div>

      {notificacaoNovos > 0 && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm font-semibold text-green-800" role="status">
          {notificacaoNovos === 1 ? "1 novo pedido recebido." : `${notificacaoNovos} novos pedidos recebidos.`}
        </div>
      )}

      {mensagemSucesso && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm font-semibold text-green-800" role="status">
          {mensagemSucesso}
        </div>
      )}

      <label className="mb-4 block max-w-sm text-sm font-semibold" htmlFor="buscar-pedido-kanban">
        Localizar pelo número
        <input
          id="buscar-pedido-kanban"
          type="search"
          inputMode="numeric"
          maxLength={10}
          value={buscaPedido}
          onChange={(event) => setBuscaPedido(event.target.value.replace(/\D/g, ""))}
          placeholder="Ex.: 125"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 outline-none focus:border-red-600"
        />
      </label>

      {erro && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800" role="alert">
          {erro}
        </div>
      )}

      {!carregando && !erro && pedidos.length === 0 && filtrosData !== null && filtrosData.dia !== null && filtrosData.mes !== null && filtrosData.ano !== null && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-center text-amber-900" role="status">
          Nenhum pedido encontrado em {String(filtrosData.dia).padStart(2, "0")}/{String(filtrosData.mes).padStart(2, "0")}/{filtrosData.ano}. As colunas continuam disponíveis e serão atualizadas automaticamente.
        </div>
      )}

      {carregando ? (
        <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow">
          Carregando pedidos...
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-5 gap-5" style={{ minWidth: 1900 }}>
            {STATUS_PEDIDO.map((status) => {
              const pedidosDaColuna = pedidosVisiveis.filter((pedido) => pedido.status === status);
              return (
                <section
                  key={status}
                  onDragOver={(event) => {
                    if (!podeMoverPara(status)) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setColunaDestino(status);
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setColunaDestino(null);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    soltarNaColuna(status);
                  }}
                  className={`min-h-80 rounded-xl border-t-4 p-3 transition ${estilosColuna[status]} ${
                    colunaDestino === status ? "ring-4 ring-red-400 ring-offset-2" : ""
                  }`}
                >
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
                        bloqueado={pedidoAtualizando !== null || recebimentoAtualizando !== null}
                        arrastando={pedidoArrastado === pedido.id}
                        recebimentoAtualizando={recebimentoAtualizando === pedido.id}
                        onRecebimento={(id, novoStatus) => void alterarRecebimento(id, novoStatus)}
                        onDragStart={iniciarArraste}
                        onDragEnd={() => {
                          setPedidoArrastado(null);
                          setColunaDestino(null);
                        }}
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

      {pedidoParaCancelar !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-cancelamento-admin">
          <section className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={fecharConfirmacaoCancelamento}
              disabled={pedidoAtualizando !== null}
              aria-label="Fechar confirmação"
              className="absolute right-3 top-3 rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
            >
              ✕
            </button>
            <h2 id="titulo-cancelamento-admin" className="pr-10 text-2xl font-bold text-gray-900">
              Cancelar pedido #{pedidoParaCancelar}?
            </h2>
            <p className="mt-3 text-gray-600">
              O cancelamento encerrará este pedido e ele não poderá voltar para outra etapa do Kanban.
            </p>
            {erroCancelamento && (
              <p className="mt-4 rounded-md bg-red-100 p-3 text-sm font-semibold text-red-800" role="alert">
                {erroCancelamento}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fecharConfirmacaoCancelamento}
                disabled={pedidoAtualizando !== null}
                className="rounded-md border px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => void confirmarCancelamento()}
                disabled={pedidoAtualizando !== null}
                className="rounded-md bg-red-700 px-5 py-2 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pedidoAtualizando !== null ? "Cancelando..." : "Confirmar cancelamento"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
