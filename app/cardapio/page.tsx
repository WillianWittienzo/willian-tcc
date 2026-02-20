"use client";

import { useState } from "react";
import { CardList } from "@/components/cardapio/CardList";
import { cardapio } from "@/components/data/cardapio";
import { FilterMenu } from "@/components/cardapio/FilterMenu"

export default function CardapioPage() {

  // 🔹 1️⃣ Estado
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");

  // 🔹 2️⃣ Lógica
  const pizzasFiltradas =
    categoriaAtiva === "Todas"
      ? cardapio
      : cardapio.filter(p => p.categoria === categoriaAtiva);

  // 🔹 3️⃣ JSX
  return (

    <main className="py-20">
      <section >
        <div className="mx-auto max-w-8xl py-20 -mt-4 bg-[hsl(0deg_83.78%_21.76%)]">
          <h1 className="text-6xl font-bold text-amber-50 flex items-center justify-center gap-2">
            Nosso<span className="text-amber-500">Cardápio</span>
          </h1>
          <p className="text-amber-50 flex justify-center text-sm">Escolha sua Pizza favorita</p>
        </div>
      </section>

      <section >
        <div className="mx-auto max-w-5xl py-10 px-6">
          <FilterMenu
            categoriaAtiva={categoriaAtiva}
            setCategoriaAtiva={setCategoriaAtiva}
          />
          <CardList items={pizzasFiltradas} />
        </div >
      </section>
    </main>
  );
}
