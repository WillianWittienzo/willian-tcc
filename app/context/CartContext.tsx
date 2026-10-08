"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Categoria } from "@/components/data/cardapio";
import { itensTemMesmaConfiguracao } from "@/lib/carrinho";
import type { NomeBorda, TamanhoProduto } from "@/lib/catalogo";

export type CartItem = {
  id: number;
  nome: string;
  categoria: Categoria;
  description: string;
  image: string;
  preco: number;
  precoOriginal: number;
  descontoPercentual: number | null;
  tamanho: TamanhoProduto;
  borda: NomeBorda;
  precoBorda: number;
  quantidade: number;
};

type ChaveItem = Pick<CartItem, "id" | "tamanho" | "borda">;
type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantidade">) => void;
  decreaseQuantity: (chave: ChaveItem) => void;
  removeFromCart: (chave: ChaveItem) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addToCart(item: Omit<CartItem, "quantidade">) {
    setItems((atuais) => {
      const chave = { id: item.id, tamanho: item.tamanho, borda: item.borda };
      return atuais.some((atual) => itensTemMesmaConfiguracao(atual, chave))
        ? atuais.map((atual) => itensTemMesmaConfiguracao(atual, chave) ? { ...atual, quantidade: atual.quantidade + 1 } : atual)
        : [...atuais, { ...item, quantidade: 1 }];
    });
  }

  function decreaseQuantity(chave: ChaveItem) {
    setItems((atuais) => atuais
      .map((item) => itensTemMesmaConfiguracao(item, chave) ? { ...item, quantidade: item.quantidade - 1 } : item)
      .filter((item) => item.quantidade > 0));
  }

  function removeFromCart(chave: ChaveItem) {
    setItems((atuais) => atuais.filter((item) => !itensTemMesmaConfiguracao(item, chave)));
  }

  return (
    <CartContext.Provider value={{ items, addToCart, decreaseQuantity, removeFromCart, clearCart: () => setItems([]) }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve estar dentro do CartProvider");
  return context;
}
