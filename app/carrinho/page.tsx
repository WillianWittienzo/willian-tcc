"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LuTrash } from "react-icons/lu";
import { useCart } from "@/app/context/CartContext";
import { criarPedido } from "@/client/pedidoClient";
import { calcularTaxaEntregaEmCentavos } from "@/lib/pedido";
import { useRouter } from "next/navigation";

export default function CarrinhoPage() {
  const [finalizando, setFinalizando] = useState(false);
  const { items, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  async function handleCheckout() {
    if (items.length === 0 || finalizando) return;
    setFinalizando(true);
    try {
      const pedido = await criarPedido({ itens: items.map((item) => ({ produtoId: item.id, tamanho: item.tamanho, borda: item.borda, quantidade: item.quantidade })) });
      clearCart();
      alert(`Pedido #${pedido.id} realizado com sucesso!`);
      router.push("/pedidos");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao finalizar pedido");
    } finally {
      setFinalizando(false);
    }
  }

  const subtotal = items.reduce((total, item) => total + (item.preco + item.precoBorda) * item.quantidade, 0);
  const entrega = calcularTaxaEntregaEmCentavos(Math.round(subtotal * 100)) / 100;

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
                  <p className="text-sm text-gray-500">Borda: {item.borda} (+R$ {item.precoBorda.toFixed(2)})</p>
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
        <div className="flex justify-between mb-4"><span>Entrega</span><span>{items.length && entrega === 0 ? "Grátis" : `R$ ${items.length ? entrega.toFixed(2) : "0.00"}`}</span></div>
        <div className="flex justify-between font-bold text-lg mb-6"><span>Total</span><span>R$ {items.length ? (subtotal + entrega).toFixed(2) : "0.00"}</span></div>
        <button type="button" onClick={handleCheckout} disabled={!items.length || finalizando} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">{finalizando ? "Finalizando..." : "Finalizar Pedido"}</button>
        <Link href="/cardapio" className="block mt-6 w-full text-black py-2 bg-yellow-600 rounded-lg transition duration-300 hover:bg-yellow-500 hover:scale-105 text-center">Continuar comprando</Link>
      </div>
    </div>
  );
}
