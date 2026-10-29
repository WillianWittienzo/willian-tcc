"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { cancelarMeuPedido, listarMeusPedidos, type Pedido } from "@/client/pedidoClient";
import { listarProdutos } from "@/client/produtoClient";
import { PedidoCard } from "@/components/pedidos/PedidoCard";
import { buscarBorda } from "@/lib/catalogo";

export default function MeusPedidosPage() {
  const [pedidosDoCliente, setPedidosDoCliente] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [repetindoId, setRepetindoId] = useState<number | null>(null);
  const [mensagemRepeticao, setMensagemRepeticao] = useState("");
  const [pedidoDestacadoId, setPedidoDestacadoId] = useState<number | null>(null);
  const consultaEmAndamento = useRef(false);
  const consultaAtual = useRef<AbortController | null>(null);
  const componenteAtivo = useRef(true);
  const { user, carregando: carregandoSessao } = useAuth();
  const { addToCart, abrirCarrinho } = useCart();
  const router = useRouter();

  const carregarPedidos = useCallback(async (silencioso = false) => {
    if (consultaEmAndamento.current) return;
    consultaEmAndamento.current = true;
    const controller = new AbortController();
    consultaAtual.current = controller;
    if (!silencioso) {
      setCarregando(true);
      setErro("");
    }
    try {
      const pedidos = await listarMeusPedidos(controller.signal);
      const pedidoDaUrl = new URLSearchParams(window.location.search).get("pedido");
      if (!componenteAtivo.current) return;
      setPedidosDoCliente(pedidos);
      setPedidoDestacadoId(pedidoDaUrl && /^\d{1,10}$/.test(pedidoDaUrl) ? Number(pedidoDaUrl) : null);
    } catch (error) {
      if (!silencioso && componenteAtivo.current && !(error instanceof DOMException && error.name === "AbortError")) {
        setErro(error instanceof Error ? error.message : "Erro ao buscar pedidos");
      }
    } finally {
      const consultaAindaAtual = consultaAtual.current === controller;
      if (consultaAindaAtual) {
        consultaEmAndamento.current = false;
        consultaAtual.current = null;
      }
      if (!silencioso && componenteAtivo.current && consultaAindaAtual) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    componenteAtivo.current = true;
    return () => {
      componenteAtivo.current = false;
      consultaAtual.current?.abort();
      consultaAtual.current = null;
      consultaEmAndamento.current = false;
    };
  }, []);

  useEffect(() => {
    if (carregandoSessao) return;
    if (!user) {
      router.replace("/login?retorno=/pedidos");
      return;
    }
    if (user.papel !== "Cliente") {
      router.replace("/admin");
      return;
    }
    const timer = window.setTimeout(() => void carregarPedidos(), 0);
    return () => window.clearTimeout(timer);
  }, [carregandoSessao, carregarPedidos, router, user]);

  useEffect(() => {
    if (carregandoSessao || user?.papel !== "Cliente") return;

    function atualizarSeVisivel() {
      if (document.visibilityState === "visible") void carregarPedidos(true);
    }

    const intervalo = window.setInterval(atualizarSeVisivel, 15_000);
    document.addEventListener("visibilitychange", atualizarSeVisivel);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", atualizarSeVisivel);
    };
  }, [carregandoSessao, carregarPedidos, user]);

  useEffect(() => {
    if (carregando || pedidoDestacadoId === null) return;
    document.getElementById(`pedido-${pedidoDestacadoId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [carregando, pedidoDestacadoId]);

  async function cancelar(pedido: Pedido) {
    const confirmado = window.confirm(
      `Cancelar o pedido #${pedido.id}? Esta ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    setCancelandoId(pedido.id);
    setErro("");
    try {
      const atualizado = await cancelarMeuPedido(pedido.id);
      setPedidosDoCliente((atuais) =>
        atuais.map((item) => item.id === atualizado.id ? atualizado : item),
      );
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao cancelar pedido");
      await carregarPedidos();
    } finally {
      setCancelandoId(null);
    }
  }

  async function repetirPedido(pedido: Pedido) {
    setRepetindoId(pedido.id);
    setMensagemRepeticao("");
    try {
      const produtos = await listarProdutos();
      const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
      const indisponiveis: string[] = [];
      const itensValidos = pedido.itens.flatMap((item) => {
        const produto = item.produtoId ? produtosPorId.get(item.produtoId) : undefined;
        const tamanho = produto?.tamanhos.find(
          (opcao) => opcao.nome === item.tamanho && Number.isFinite(opcao.preco) && opcao.preco > 0,
        );
        const borda = buscarBorda(item.borda ?? "Sem borda");

        if (!produto || !produto.disponivel || !tamanho || !borda) {
          indisponiveis.push(`${item.nomeProduto} (${item.tamanho}${item.borda ? `, borda ${item.borda}` : ""})`);
          return [];
        }

        return [{
          item: {
            id: produto.id,
            nome: produto.nome,
            categoria: produto.categoria,
            description: produto.description,
            image: produto.image,
            preco: tamanho.precoPromocional ?? tamanho.preco,
            precoOriginal: tamanho.preco,
            descontoPercentual: produto.descontoPercentual,
            tamanho: tamanho.nome,
            borda: borda.nome,
            precoBorda: borda.preco,
            observacao: item.observacao ?? "",
            tamanhos: produto.tamanhos,
          },
          quantidade: item.quantidade,
        }];
      });

      if (itensValidos.length === 0) {
        throw new Error(`Nenhum item deste pedido está disponível: ${indisponiveis.join("; ")}.`);
      }

      itensValidos.forEach(({ item, quantidade }) => addToCart(item, quantidade));
      setMensagemRepeticao(
        indisponiveis.length > 0
          ? `Os itens disponíveis do pedido #${pedido.id} foram adicionados. Não disponíveis: ${indisponiveis.join("; ")}.`
          : `Pedido #${pedido.id} adicionado ao carrinho com os preços atuais.`,
      );
      abrirCarrinho();
    } catch (error) {
      setMensagemRepeticao(error instanceof Error ? error.message : "Não foi possível repetir o pedido.");
    } finally {
      setRepetindoId(null);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-28">
      <h1 className="mb-2 text-3xl font-bold">Minhas Pizzas</h1>
      <p className="mb-6 text-gray-600">Acompanhe os detalhes e o status dos seus pedidos.</p>

      {pedidoDestacadoId !== null && pedidosDoCliente.some((pedido) => pedido.id === pedidoDestacadoId) && (
        <p className="mb-6 rounded-md bg-green-100 p-4 font-semibold text-green-800" role="status">
          Pedido #{pedidoDestacadoId} confirmado! Acompanhe o status abaixo.
        </p>
      )}

      {mensagemRepeticao && (
        <p className="mb-6 rounded-md bg-amber-50 p-4 text-amber-900" role="status">
          {mensagemRepeticao}
        </p>
      )}

      {carregandoSessao || carregando ? (
        <div className="rounded-xl bg-white p-6 text-center text-gray-600 shadow">
          Carregando pedidos...
        </div>
      ) : erro ? (
        <div className="rounded-xl bg-white p-6 text-center text-red-700 shadow" role="alert">
          <p className="font-bold">Não foi possível carregar seus pedidos</p>
          <p className="mt-1 text-sm">{erro}</p>
          <button type="button" onClick={() => void carregarPedidos()} className="mt-4 rounded-md bg-red-700 px-4 py-2 font-semibold text-white">Tentar novamente</button>
        </div>
      ) : pedidosDoCliente.length === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-400 bg-amber-50 p-10 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-950">Sua lista de pizzas ainda está vazia</p>
          <p className="mt-2 text-amber-900">Quando você fizer um pedido, o acompanhamento aparecerá aqui.</p>
          <Link href="/cardapio" className="mt-5 inline-block rounded-lg bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800">Escolher uma pizza</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidosDoCliente.map((pedido) => (
            <div
              key={pedido.id}
              id={`pedido-${pedido.id}`}
              className={pedido.id === pedidoDestacadoId ? "scroll-mt-24 rounded-xl ring-4 ring-green-500 ring-offset-2" : ""}
            >
              <PedidoCard pedido={pedido} exibirAcompanhamento>
                <div className="flex flex-wrap gap-3 border-t pt-4">
                  <button
                    type="button"
                    disabled={repetindoId !== null}
                    onClick={() => void repetirPedido(pedido)}
                    className="rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {repetindoId === pedido.id ? "Adicionando..." : "Repetir pedido"}
                  </button>
                  {pedido.status === "Pendente" && (
                    <button
                      type="button"
                      disabled={cancelandoId !== null || repetindoId !== null}
                      onClick={() => void cancelar(pedido)}
                      className="rounded-md border border-red-700 px-4 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancelandoId === pedido.id ? "Cancelando..." : "Cancelar pedido"}
                    </button>
                  )}
                </div>
              </PedidoCard>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
