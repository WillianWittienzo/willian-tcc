"use client"

import Image from "next/image"
import { useCart } from "@/app/context/CartContext"
import { LuTrash } from "react-icons/lu"
import Link from "next/link"


import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"





export default function CarrinhoPage() {
  const router = useRouter()
  const { user } = useAuth()
  function handleCheckout() {
    if (!user) {
      router.push("/login")
      return
    }

    if (!user.endereco) {
      router.push("/cadastro-endereco")
      return
    }

    router.push("/checkout")
  }
  const { items, addToCart, decreaseQuantity, removeFromCart } = useCart()

  const subtotal = items.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  )

  const entrega = 8
  const total = subtotal + entrega

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20 grid md:grid-cols-3 gap-8">


      <div className="md:col-span-2 space-y-4">
        {items.length === 0 ? (
          <p className="text-center text-gray-500">
            Seu carrinho está vazio 🍕
          </p>
        ) : (
          items.map(item => (
            <div
              key={`${item.id}-${item.tamanho}`}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div className="flex gap-4 items-center">
                <Image
                  src={item.image}
                  alt={item.nome}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />

                <div>
                  <h2 className="font-bold">{item.nome}</h2>

                  <p className="text-sm text-gray-500">
                    Tamanho: {item.tamanho}
                  </p>

                  <p className="text-sm text-gray-500">
                    R$ {item.preco.toFixed(2)}
                  </p>



                  <div className="flex items-center gap-3 mt-2">

                    <button
                      onClick={() => decreaseQuantity(item.id, item.tamanho)}
                      className="border border-red-500 text-red-500 w-8 h-8 rounded-lg"
                    >
                      -
                    </button>

                    <span>{item.quantidade}</span>

                    <button
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          nome: item.nome,
                          categoria: item.categoria,
                          preco: item.preco,
                          tamanho: item.tamanho,
                          image: item.image,
                          description: item.description
                        })
                      }
                      className="border border-red-500 text-red-500 w-8 h-8 rounded-lg"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id, item.tamanho)}
                      className="text-red-500 ml-2"
                    >
                      <LuTrash />
                    </button>

                  </div>
                </div>
              </div>


              <span className="font-semibold">
                R$ {(item.preco * item.quantidade).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow h-fit">
        <h2 className="text-lg font-bold mb-4">Resumo</h2>

        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between mb-4">
          <span>Entrega</span>
          <span>R$ {items.length > 0 ? entrega.toFixed(2) : "0.00"}</span>
        </div>

        <div className="flex justify-between font-bold text-lg mb-6">
          <span>Total</span>
          <span>
            R$ {items.length > 0 ? total.toFixed(2) : "0.00"}
          </span>
        </div>

        <button onClick={handleCheckout} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition  hover:scale-105">
          Finalizar Pedido
        </button>
        <Link href="/cardapio" className="block mt-6 w-full  text-black py-2 bg-yellow-600 rounded-lg transition duration-300 hover:bg-yellow-500  hover:scale-105 text-center"> Continuar comprando</Link>

      </div>
    </div>
  )
}