"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Card } from "@/components/data/cardapio"

type CartItem = Card & {
  quantidade: number
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: Card) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function addToCart(item: Card) {
    setItems(prev => {
      const existente = prev.find(p => p.id === item.id)

      if (existente) {
        return prev.map(p =>
          p.id === item.id
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        )
      }

      return [...prev, { ...item, quantidade: 1 }]
    })
  }

  return (
    <CartContext.Provider value={{ items, addToCart }}>
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
