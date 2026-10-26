"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Categoria, Tamanho } from "@/components/data/cardapio";
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
  tamanhos: Tamanho[];
  quantidade: number;
};

type ChaveItem = Pick<CartItem, "id" | "tamanho" | "borda">;
type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantidade">, quantidade?: number) => void;
  decreaseQuantity: (chave: ChaveItem) => void;
  removeFromCart: (chave: ChaveItem) => void;
  updateCartItem: (chave: ChaveItem, item: Omit<CartItem, "quantidade">, quantidade: number) => void;
  clearCart: () => void;
  carrinhoAberto: boolean;
  abrirCarrinho: () => void;
  fecharCarrinho: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const CHAVE_STORAGE = "brasa-quente-carrinho";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const storageCarregado = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_STORAGE) ?? "[]") as unknown;
        if (Array.isArray(salvo)) setItems(salvo as CartItem[]);
      } catch {
        localStorage.removeItem(CHAVE_STORAGE);
      }
      storageCarregado.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (storageCarregado.current) localStorage.setItem(CHAVE_STORAGE, JSON.stringify(items));
  }, [items]);

  function addToCart(item: Omit<CartItem, "quantidade">, quantidade = 1) {
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 99) return;
    setItems((atuais) => {
      const chave = { id: item.id, tamanho: item.tamanho, borda: item.borda };
      return atuais.some((atual) => itensTemMesmaConfiguracao(atual, chave))
        ? atuais.map((atual) => itensTemMesmaConfiguracao(atual, chave) ? { ...atual, quantidade: Math.min(99, atual.quantidade + quantidade) } : atual)
        : [...atuais, { ...item, quantidade }];
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

  function updateCartItem(
    chave: ChaveItem,
    itemAtualizado: Omit<CartItem, "quantidade">,
    quantidade: number,
  ) {
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 99) return;
    setItems((atuais) => {
      const restantes = atuais.filter((item) => !itensTemMesmaConfiguracao(item, chave));
      const novaChave = {
        id: itemAtualizado.id,
        tamanho: itemAtualizado.tamanho,
        borda: itemAtualizado.borda,
      };
      const itemIgual = restantes.find((item) => itensTemMesmaConfiguracao(item, novaChave));

      if (!itemIgual) return [...restantes, { ...itemAtualizado, quantidade }];

      return restantes.map((item) => itensTemMesmaConfiguracao(item, novaChave)
        ? { ...itemAtualizado, quantidade: Math.min(99, item.quantidade + quantidade) }
        : item);
    });
  }

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      decreaseQuantity,
      removeFromCart,
      updateCartItem,
      clearCart: () => setItems([]),
      carrinhoAberto,
      abrirCarrinho: () => setCarrinhoAberto(true),
      fecharCarrinho: () => setCarrinhoAberto(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve estar dentro do CartProvider");
  return context;
}
