"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LuTrash } from "react-icons/lu";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { criarPedido, type Pedido } from "@/client/pedidoClient";
import { CheckoutModal } from "@/components/carrinho/CheckoutModal";
import { criarUrlAutenticacao, type DadosCheckout } from "@/lib/checkout";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function CarrinhoPage() {
  const [finalizando, setFinalizando] = useState(false);
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<Pedido | null>(null);
  const [erroFluxo, setErroFluxo] = useState("");
  const retornoTratado = useRef(false);
  const finalizacaoEmAndamento = useRef(false);
  const router = useRouter();
  const { user, carregando } = useAuth();
  const { items, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCart();

  useEffect(() => {
    if (carregando || retornoTratado.current) return;
    const checkoutSolicitado = new URLSearchParams(window.location.search).get("checkout") === "1";
    if (!checkoutSolicitado) return;

    if (!user) {
      retornoTratado.current = true;
      router.replace(criarUrlAutenticacao("/login"));
      return;
    }
    if (user.papel === "Admin") {
      const timer = window.setTimeout(() => {
        retornoTratado.current = true;
        setErroFluxo("A conta administrativa não pode finalizar compras. Entre com uma conta de cliente.");
      }, 0);
      return () => window.clearTimeout(timer);
    }
    if (!items.length) return;

    const timer = window.setTimeout(() => {
      retornoTratado.current = true;
      setCheckoutAberto(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [carregando, items.length, router, user]);

  function abrirCheckout() {
    if (items.length === 0 || finalizando || carregando) return;
    setErroFluxo("");
    if (!user) {
      router.push(criarUrlAutenticacao("/login"));
      return;
    }
    if (user.papel === "Admin") {
      setErroFluxo("A conta administrativa não pode finalizar compras. Entre com uma conta de cliente.");
      return;
    }
    setCheckoutAberto(true);
  }

  async function confirmarPedido(dadosCheckout: DadosCheckout) {
    if (items.length === 0 || finalizando || finalizacaoEmAndamento.current || user?.papel !== "Cliente") return;
    finalizacaoEmAndamento.current = true;
    setFinalizando(true);
    try {
      const pedido = await criarPedido({
        dadosCheckout,
        itens: items.map((item) => ({
          produtoId: item.id,
          tamanho: item.tamanho,
          borda: item.borda,
          observacao: item.observacao ?? "",
          quantidade: item.quantidade,
        })),
      });
      clearCart();
      setCheckoutAberto(false);
      setPedidoConfirmado(pedido);
    } finally {
      finalizacaoEmAndamento.current = false;
      setFinalizando(false);
    }
  }

  const subtotal = items.reduce((total, item) => total + (item.preco + item.precoBorda) * item.quantidade, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        {items.length === 0 ? <p className="text-center text-gray-500">Seu carrinho está vazio 🍕</p> : items.map((item) => {
          const chave = { id: item.id, tamanho: item.tamanho, borda: item.borda, observacao: item.observacao ?? "" };
          return (
            <div key={`${item.id}-${item.tamanho}-${item.borda}-${item.observacao ?? ""}`} className="bg-white p-4 rounded-xl shadow flex justify-between items-center gap-4">
              <div className="flex gap-4 items-center">
                <Image src={item.image} alt={item.nome} width={80} height={80} className="rounded-lg object-cover" />
                <div>
                  <h2 className="font-bold">{item.nome}</h2>
                  <p className="text-sm text-gray-500">Tamanho: {item.tamanho}</p>
                  <p className="text-sm text-gray-500">
                    Borda: {item.borda}{item.precoBorda > 0 ? ` (+R$ ${item.precoBorda.toFixed(2)})` : " — R$ 0,00"}
                  </p>
                  {item.observacao && <p className="text-sm text-gray-500">Observação: {item.observacao}</p>}
                  <p className="text-sm text-gray-500">R$ {(item.preco + item.precoBorda).toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button type="button" onClick={() => decreaseQuantity(chave)} className="border border-red-500 text-red-500 w-8 h-8 rounded-lg">-</button>
                    <span>{item.quantidade}</span>
                    <button type="button" onClick={() => addToCart({
                      id: item.id,
                      nome: item.nome,
                      categoria: item.categoria,
                      description: item.description,
                      image: item.image,
                      preco: item.preco,
                      precoOriginal: item.precoOriginal,
                      descontoPercentual: item.descontoPercentual,
                      tamanho: item.tamanho,
                      borda: item.borda,
                      precoBorda: item.precoBorda,
                      observacao: item.observacao ?? "",
                      tamanhos: item.tamanhos,
                    })} className="border border-red-500 text-red-500 w-8 h-8 rounded-lg">+</button>
                    <button type="button" aria-label="Remover item" onClick={() => removeFromCart(chave)} className="text-red-500 ml-2"><LuTrash /></button>
                  </div>
                </div>
              </div>
              <span className="font-semibold">R$ {((item.preco + item.precoBorda) * item.quantidade).toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-xl shadow h-fit">
        <h2 className="text-lg font-bold mb-4">Resumo</h2>
        <div className="flex justify-between mb-2"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
        <p className="mb-4 text-sm text-gray-500">A taxa e o total serão exibidos após escolher Entrega ou Retirada.</p>
        {erroFluxo && <p role="alert" className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">{erroFluxo}</p>}
        <button type="button" onClick={abrirCheckout} disabled={!items.length || finalizando || carregando} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">{carregando ? "Verificando sessão..." : "Finalizar Pedido"}</button>
        <Link href="/cardapio" className="block mt-6 w-full text-black py-2 bg-yellow-600 rounded-lg transition duration-300 hover:bg-yellow-500 hover:scale-105 text-center">Continuar comprando</Link>
      </div>

      {checkoutAberto && (
        <CheckoutModal
          enviando={finalizando}
          itens={items}
          subtotal={subtotal}
          onCancelar={() => setCheckoutAberto(false)}
          onConfirmar={confirmarPedido}
        />
      )}

      {pedidoConfirmado && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacao">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 id="titulo-confirmacao" className="text-2xl font-bold text-green-700">Pedido realizado com sucesso!</h2>
            <p className="mt-2 text-lg font-semibold">Pedido #{pedidoConfirmado.id}</p>

            <div className="mt-5 divide-y rounded-lg bg-gray-50 px-4">
              {pedidoConfirmado.itens.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span>
                    {item.quantidade}× {item.nomeProduto} ({item.tamanho})
                    {item.observacao && <small className="block text-gray-500">Observação: {item.observacao}</small>}
                  </span>
                  <span className="font-semibold">{moeda.format((item.precoUnitario + item.precoBorda) * item.quantidade)}</span>
                </div>
              ))}
            </div>

            <dl className="mt-4 space-y-2 border-t pt-4">
              <div className="flex justify-between gap-4">
                <dt>Atendimento</dt>
                <dd className="font-semibold">{pedidoConfirmado.metodoEntrega === "Retirada" ? "Retirada no local" : "Entrega"}</dd>
              </div>
              <div className="flex justify-between gap-4 text-lg font-bold">
                <dt>Valor final</dt>
                <dd>{moeda.format(pedidoConfirmado.valorTotal)}</dd>
              </div>
            </dl>

            <Link href={`/pedidos?pedido=${pedidoConfirmado.id}`} className="mt-6 block rounded-md bg-green-700 px-5 py-3 text-center font-semibold text-white hover:bg-green-800">
              Acompanhar em Minhas Pizzas
            </Link>
            <Link href="/cardapio" onClick={() => setPedidoConfirmado(null)} className="mt-3 block rounded-md border border-red-700 px-5 py-3 text-center font-semibold text-red-700 hover:bg-red-50">
              Voltar ao cardápio
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
