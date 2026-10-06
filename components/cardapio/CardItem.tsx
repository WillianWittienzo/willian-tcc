"use client";

import Image from "next/image";
import { useState } from "react";
import { LuTrash } from "react-icons/lu";
import { useCart } from "@/app/context/CartContext";
import type { Card } from "@/components/data/cardapio";
import { BORDAS } from "@/lib/catalogo";

export function CardItem({ id, nome, categoria, image, description, tamanhos, descontoPercentual }: Card) {
  const { items, addToCart, decreaseQuantity, removeFromCart } = useCart();
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(tamanhos[0]);
  const [bordaSelecionada, setBordaSelecionada] = useState<(typeof BORDAS)[number]>(BORDAS[0]);
  const chave = { id, tamanho: tamanhoSelecionado.nome, borda: bordaSelecionada.nome };
  const itemNoCarrinho = items.find((item) => item.id === id && item.tamanho === chave.tamanho && item.borda === chave.borda);
  const precoPizza = tamanhoSelecionado.precoPromocional ?? tamanhoSelecionado.preco;

  const adicionar = () => addToCart({
    id,
    nome,
    categoria,
    image,
    description,
    preco: precoPizza,
    tamanho: tamanhoSelecionado.nome,
    borda: bordaSelecionada.nome,
    precoBorda: bordaSelecionada.preco,
  });

  return (
    <div className="rounded-xl bg-white p-4 shadow relative hover:-translate-y-1 transition-all duration-200">
      <div className="relative h-52 w-full">
        <Image src={image} alt={nome} fill unoptimized={image.startsWith("http")} sizes="(max-width: 768px) 100vw, 33vw" className="rounded-sm object-cover" />
      </div>
      <div className="absolute top-5 left-5 bg-red-800/90 backdrop-blur-sm rounded-lg px-3 py-1">
        <p className="text-[13px] text-white leading-none">{categoria}</p>
      </div>
      {descontoPercentual !== null && (
        <div className="absolute top-5 right-5 rounded-lg bg-amber-500 px-3 py-1 text-sm font-bold text-black">
          -{descontoPercentual}%
        </div>
      )}

      <h3 className="mt-2 text-lg font-bold">{nome}</h3>
      <p className="mt-2 text-black">{description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {tamanhos.map((tamanho) => (
          <button key={tamanho.nome} type="button" onClick={() => setTamanhoSelecionado(tamanho)} className={`px-3 py-1 rounded-md border ${tamanhoSelecionado.nome === tamanho.nome ? "bg-red-600 text-white" : "border-gray-300"}`}>
            {tamanho.nome}
          </button>
        ))}
      </div>

      <label className="mt-3 block text-sm font-semibold" htmlFor={`borda-${id}`}>Borda</label>
      <select id={`borda-${id}`} value={bordaSelecionada.nome} onChange={(event) => setBordaSelecionada(BORDAS.find((borda) => borda.nome === event.target.value) ?? BORDAS[0])} className="mt-1 w-full rounded-md border p-2">
        {BORDAS.map((borda) => <option key={borda.nome} value={borda.nome}>{borda.nome} (+R$ {borda.preco.toFixed(2)})</option>)}
      </select>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          {tamanhoSelecionado.precoPromocional !== null && <p className="text-sm text-gray-500 line-through">R$ {tamanhoSelecionado.preco.toFixed(2)}</p>}
          <span className="text-[hsl(33_100%_50%)] font-semibold text-2xl">R$ {(precoPizza + bordaSelecionada.preco).toFixed(2)}</span>
        </div>
        {!itemNoCarrinho ? (
          <button type="button" onClick={adicionar} className="bg-red-600 text-white px-4 py-2 rounded-lg">Adicionar</button>
        ) : (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => decreaseQuantity(chave)} className="border border-red-500 text-red-500 w-8 h-8 rounded-lg">-</button>
            <span>{itemNoCarrinho.quantidade}</span>
            <button type="button" onClick={adicionar} className="border border-red-500 text-red-500 w-8 h-8 rounded-lg">+</button>
            <button type="button" aria-label="Remover item" onClick={() => removeFromCart(chave)} className="text-red-500"><LuTrash /></button>
          </div>
        )}
      </div>
    </div>
  );
}
