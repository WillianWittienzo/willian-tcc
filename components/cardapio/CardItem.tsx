import Image from "next/image"
import { Categoria } from "../data/cardapio"
import { useCart } from "@/app/context/CartContext"
import { LuTrash } from "react-icons/lu"

type CardItemProps = {
  id: number
  nome: string
  categoria: Categoria
  preco: number
  image: string
  description: string
}

export function CardItem({ nome, preco, categoria, image, description, id }: CardItemProps) {
  const { items, addToCart, decreaseQuantity, removeFromCart } = useCart()

  const itemNoCarrinho = items.find(item => item.id === id)

  return (
    <div className="rounded-xl bg-white p-4 shadow relative hover:-translate-y-1 transition-all duration-200">
      <Image src={image} alt={nome} width={350} height={300} className="rounded-sm" />

      <div className="absolute top-5 left-5 bg-red-800/90 backdrop-blur-sm rounded-lg px-3 py-1">
        <p className="text-[13px] text-white leading-none">
          {categoria}
        </p>
      </div>

      <h3 className="mt-2 text-lg font-bold">{nome}</h3>
      <p className="mt-2 text-black">{description}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[hsl(33_100%_50%)] font-semibold text-2xl">
          R$ {preco.toFixed(2)}
        </span>

        {!itemNoCarrinho ? (
          <button
            onClick={() => addToCart({ id, nome, categoria, preco, image, description })}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Adicionar
          </button>
        ) : (
          <div className="flex items-center gap-3">

            <button
              onClick={() => decreaseQuantity(id)}
              className="border border-red-500 text-red-500 w-8 h-8 rounded-lg"
            >
              -
            </button>

            <span>{itemNoCarrinho.quantidade}</span>

            <button
              onClick={() => addToCart({ id, nome, categoria, preco, image, description })}
              className="border border-red-500 text-red-500 w-8 h-8 rounded-lg"
            >
              +
            </button>

            <button
              onClick={() => removeFromCart(id)}
              className="text-red-500"
            >
              <LuTrash />
            </button>

          </div>
        )}
      </div>
    </div>
  )
}