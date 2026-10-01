"use client";

import { useEffect, useState } from "react";
import { CardList } from "@/components/cardapio/CardList";
import { FilterMenu } from "@/components/cardapio/FilterMenu";
import { listarProdutos } from "@/client/produtoClient";
import type { Card } from "@/components/data/cardapio";

export default function CardapioPage() {


  const [produtos, setProdutos] = useState<Card[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const dados = await listarProdutos();
        setProdutos(dados);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    }

    carregarProdutos();
  }, []);


  const pizzasFiltradas =
    categoriaAtiva === "Todas"
      ? produtos
      : produtos.filter(p => p.categoria === categoriaAtiva);


  return (

    <main className="py-20">
      <section>
        <div className="mx-auto max-w-8xl py-20 -mt-4 bg-[hsl(0deg_83.78%_21.76%)]">
          <h1 className="text-6xl font-bold text-amber-50 flex items-center justify-center gap-2">
            Nosso<span className="text-amber-500">Cardápio</span>
          </h1>
          <p className="text-amber-50 flex justify-center text-sm">
            Escolha sua Pizza favorita
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl py-10 px-6">
          <FilterMenu
            categoriaAtiva={categoriaAtiva}
            setCategoriaAtiva={setCategoriaAtiva}
          />

          <CardList items={pizzasFiltradas} />
        </div>
      </section>
    </main>
  );
}