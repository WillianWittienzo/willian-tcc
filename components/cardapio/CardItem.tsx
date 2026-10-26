"use client";

import Image from "next/image";
import { useState } from "react";
import type { Card } from "@/components/data/cardapio";
import { PizzaCustomizationModal } from "@/components/cardapio/PizzaCustomizationModal";
import { useCart } from "@/app/context/CartContext";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CardItem(produto: Card) {
  const [aberto, setAberto] = useState(false);
  const { abrirCarrinho } = useCart();
  const tamanhosValidos = produto.tamanhos.filter(
    (tamanho) => Number.isFinite(tamanho.preco) && tamanho.preco > 0,
  );
  const menorTamanho = tamanhosValidos[0];

  return (
    <>
      <article className="relative overflow-hidden rounded-xl bg-white shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <button
          type="button"
          onClick={() => setAberto(true)}
          disabled={!menorTamanho}
          className="block h-full w-full p-4 text-left disabled:cursor-not-allowed"
          aria-label={`Comprar pizza ${produto.nome}`}
        >
          <div className="relative h-52 w-full">
            <Image
              src={produto.image}
              alt={produto.nome}
              fill
              unoptimized={produto.image.startsWith("http")}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="rounded-sm object-cover"
            />
          </div>
          <span className="absolute left-5 top-5 rounded-lg bg-red-800/90 px-3 py-1 text-[13px] leading-none text-white backdrop-blur-sm">
            {produto.categoria}
          </span>
          {produto.descontoPercentual !== null && (
            <span className="absolute right-5 top-5 rounded-lg bg-amber-500 px-3 py-1 text-sm font-bold text-black">
              -{produto.descontoPercentual}%
            </span>
          )}

          <h2 className="mt-3 text-lg font-bold">{produto.nome}</h2>
          <p className="mt-2 line-clamp-2 text-black">{produto.description}</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500">A partir de</p>
              <span className="text-xl font-semibold text-[hsl(33_100%_50%)]">
                {menorTamanho
                  ? moeda.format(menorTamanho.precoPromocional ?? menorTamanho.preco)
                  : "Indisponível"}
              </span>
            </div>
            <span className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">
              Comprar
            </span>
          </div>
        </button>
      </article>

      {aberto && (
        <PizzaCustomizationModal
          produto={produto}
          onClose={() => setAberto(false)}
          onAdded={abrirCarrinho}
        />
      )}
    </>
  );
}
