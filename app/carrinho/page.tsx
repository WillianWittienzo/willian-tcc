"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LuTrash } from "react-icons/lu";
import { useCart } from "@/app/context/CartContext";
import { criarPedido } from "@/client/pedidoClient";
import { CheckoutModal } from "@/components/carrinho/CheckoutModal";
import type { DadosCheckout } from "@/lib/checkout";

export default function CarrinhoPage() {
  const [finalizando, setFinalizando] = useState(false);
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<number | null>(null);
  const [telefoneConfirmado, setTelefoneConfirmado] = useState("");
  const { items, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCart();

  function abrirCheckout() {
    if (items.length === 0 || finalizando) return;
    setCheckoutAberto(true);
  }

  async function confirmarPedido(dadosCheckout: DadosCheckout) {
    if (items.length === 0 || finalizando) return;
    setFinalizando(true);
    try {
      const pedido = await criarPedido({
        dadosCheckout,
        itens: items.map((item) => ({
          produtoId: item.id,
          tamanho: item.tamanho,
          borda: item.borda,
          quantidade: item.quantidade,
        })),
      });
      clearCart();
      setCheckoutAberto(false);
      setPedidoConfirmado(pedido.id);
      setTelefoneConfirmado(dadosCheckout.telefone);
    } finally {
      setFinalizando(false);
    }
  }

  const subtotal = items.reduce((total, item) => total + (item.preco + item.precoBorda) * item.quantidade, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        {items.length === 0 ? <p className="text-center text-gray-500">Seu carrinho está vazio 🍕</p> : items.map((item) => {
          const chave = { id: item.id, tamanho: item.tamanho, borda: item.borda };
          return (
            <div key={`${item.id}-${item.tamanho}-${item.borda}`} className="bg-white p-4 rounded-xl shadow flex justify-between items-center gap-4">
              <div className="flex gap-4 items-center">
                <Image src={item.image} alt={item.nome} width={80} height={80} className="rounded-lg object-cover" />
                <div>
                  <h2 className="font-bold">{item.nome}</h2>
                  <p className="text-sm text-gray-500">Tamanho: {item.tamanho}</p>
                  <p className="text-sm text-gray-500">
                    Borda: {item.borda}{item.precoBorda > 0 ? ` (+R$ ${item.precoBorda.toFixed(2)})` : " — R$ 0,00"}
                  </p>
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
        <button type="button" onClick={abrirCheckout} disabled={!items.length || finalizando} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">Finalizar Pedido</button>
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

      {pedidoConfirmado !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacao">
          <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl">
            <h2 id="titulo-confirmacao" className="text-2xl font-bold text-green-700">Pedido confirmado!</h2>
            <p className="mt-3 text-lg">Pedido #{pedidoConfirmado} realizado com sucesso.</p>
            <p className="mt-2 text-sm text-gray-500">Telefone utilizado: {telefoneConfirmado.replace(/^(\d{2})\d+(\d{4})$/, "($1) *****-$2")}</p>
            <Link href={`/acompanhar-pedido?pedido=${pedidoConfirmado}`} className="mt-6 block rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
              Acompanhar pedido
            </Link>
            <Link href="/cardapio" onClick={() => setPedidoConfirmado(null)} className="mt-6 block rounded-md bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700">
              Voltar ao cardápio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
