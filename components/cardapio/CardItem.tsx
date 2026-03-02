"use client"

import Image from "next/image"
import { Categoria } from "../data/cardapio"
import { useCart } from "@/app/context/CartContext"
import { LuTrash } from "react-icons/lu"
import { useState } from "react"

type Tamanho = {
  nome: "Pequena" | "Média" | "Grande"
  preco: number
}

type CardItemProps = {
  id: number
  nome: string
  categoria: Categoria
  image: string
  description: string
  tamanhos: Tamanho[]
}

export function CardItem({
  nome,
  categoria,
  image,
  description,
  tamanhos,
  id
}: CardItemProps) {

  const { items, addToCart, decreaseQuantity, removeFromCart } = useCart()

  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Tamanho>(
    tamanhos[0]
  )


  const itemNoCarrinho = items.find(
    item => item.id === id && item.tamanho === tamanhoSelecionado.nome
  )

  return (
    <div className="rounded-xl bg-white p-4 shadow relative hover:-translate-y-1 transition-all duration-200">

      <Image
        src={image}
        alt={nome}
        width={350}
        height={300}
        className="rounded-sm"
      />

      <div className="absolute top-5 left-5 bg-red-800/90 backdrop-blur-sm rounded-lg px-3 py-1">
        <p className="text-[13px] text-white leading-none">
          {categoria}
        </p>
      </div>

      <h3 className="mt-2 text-lg font-bold">{nome}</h3>
      <p className="mt-2 text-black">{description}</p>

      <div className="mt-3 flex gap-2">
        {tamanhos.map(tamanho => (
          <button
            key={tamanho.nome}
            onClick={() => setTamanhoSelecionado(tamanho)}
            className={`px-3 py-1 rounded-md border ${
              tamanhoSelecionado.nome === tamanho.nome
                ? "bg-red-600 text-white"
                : "border-gray-300"
            }`}
          >
            {tamanho.nome}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[hsl(33_100%_50%)] font-semibold text-2xl">
          R$ {tamanhoSelecionado.preco.toFixed(2)}
        </span>

        {!itemNoCarrinho ? (
          <button
            onClick={() =>
              addToCart({
                id,
                nome,
                categoria,
                image,
                description,
                preco: tamanhoSelecionado.preco,
                tamanho: tamanhoSelecionado.nome
              })
            }
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Adicionar
          </button>
        ) : (
          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                decreaseQuantity(id, tamanhoSelecionado.nome)
              }
              className="border border-red-500 text-red-500 w-8 h-8 rounded-lg"
            >
              -
            </button>

            <span>{itemNoCarrinho.quantidade}</span>

            <button
              onClick={() =>
                addToCart({
                  id,
                  nome,
                  categoria,
                  image,
                  description,
                  preco: tamanhoSelecionado.preco,
                  tamanho: tamanhoSelecionado.nome
                })
              }
              className="border border-red-500 text-red-500 w-8 h-8 rounded-lg"
            >
              +
            </button>

            <button
              onClick={() =>
                removeFromCart(id, tamanhoSelecionado.nome)
              }
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