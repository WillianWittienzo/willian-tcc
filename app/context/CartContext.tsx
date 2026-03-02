"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Categoria } from "@/components/data/cardapio"

type CartItem = {
  id: number
  nome: string
  categoria: Categoria
  description: string
  image: string
  preco: number
  tamanho: "Pequena" | "Média" | "Grande"
  quantidade: number
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, "quantidade">) => void
  decreaseQuantity: (id: number, tamanho: CartItem["tamanho"]) => void
  removeFromCart: (id: number, tamanho: CartItem["tamanho"]) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {

  const [items, setItems] = useState<CartItem[]>([])

  // ✅ ADICIONAR AO CARRINHO
  function addToCart(item: Omit<CartItem, "quantidade">) {
    setItems(prev => {

      const existente = prev.find(
        p => p.id === item.id && p.tamanho === item.tamanho
      )

      // Se já existir mesmo id + mesmo tamanho → aumenta quantidade
      if (existente) {
        return prev.map(p =>
          p.id === item.id && p.tamanho === item.tamanho
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        )
      }

      // Se não existir → adiciona novo item
      return [...prev, { ...item, quantidade: 1 }]
    })
  }

  // ✅ DIMINUIR QUANTIDADE
  function decreaseQuantity(id: number, tamanho: CartItem["tamanho"]) {
    setItems(prev =>
      prev
        .map(item =>
          item.id === id && item.tamanho === tamanho
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter(item => item.quantidade > 0)
    )
  }

  // ✅ REMOVER ITEM COMPLETAMENTE
  function removeFromCart(id: number, tamanho: CartItem["tamanho"]) {
    setItems(prev =>
      prev.filter(item => !(item.id === id && item.tamanho === tamanho))
    )
  }

  return (
    <CartContext.Provider
      value={{ items, addToCart, decreaseQuantity, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart deve estar dentro do CartProvider")
  }
  return context
}