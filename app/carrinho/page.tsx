"use client"

import { useCart } from "@/app/context/CartContext"

export default function CarrinhoPage() {

  const { items } = useCart()

  const subtotal = items.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  )

  const taxaEntrega = 8
  const total = subtotal + taxaEntrega

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      <h1 className="text-3xl font-bold mb-6">
        SEU CARRINHO
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Itens */}
        <div className="md:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow flex justify-between">
              <div>
                <h2 className="font-bold">{item.nome}</h2>
                <p>Quantidade: {item.quantidade}</p>
              </div>
              <span>
                R$ {(item.preco * item.quantidade).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="bg-white p-6 rounded-xl shadow h-fit">
          <h2 className="font-bold mb-4">Resumo</h2>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Entrega</span>
            <span>R$ {taxaEntrega.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold mt-4">
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>

          <button className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg">
            Finalizar Pedido
          </button>
        </div>

      </div>
    </div>
  )
}