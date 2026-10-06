"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoArrowRight } from "react-icons/go";
import { CardItemHome } from "@/components/cardapio/CardItemHome";
import { cards, type Card } from "@/components/data/cardapio";
import { listarProdutos } from "@/client/produtoClient";

export default function Home() {
  const [produtos, setProdutos] = useState<Card[]>([]);

  useEffect(() => {
    listarProdutos().then(setProdutos).catch(() => setProdutos([]));
  }, []);

  return (
    <main>
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-[url('/pizzas/quatro-queijos.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-red-950 opacity-65" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white">
              PIZZAS QUE<br /><span className="text-[hsl(33_100%_50%)]">AQUECEM A ALMA</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/80">Experimente o sabor autêntico das nossas pizzas artesanais, feitas com ingredientes frescos e muito carinho.</p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/cardapio" className="rounded-lg bg-[hsl(33_100%_50%)] group flex items-center gap-2 px-6 py-3 font-semibold text-black animate-pulse-glow">Peça Agora <GoArrowRight size={22} className="transition-transform duration-300 group-hover:translate-x-1" /></Link>
              <Link href="/sobre" className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white hover:text-black transition animate-pulse-glow">Conheça-nos</Link>
            </div>
          </div>
        </div>
      </section>
      <CardCarousel />

      <section>
        <h2 className="text-[48px] text-black text-center">PIZZAS <span className="text-[hsl(33_100%_50%)]">POPULARES</span></h2>
        <div className="mx-auto grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 md:grid-cols-3">
          {produtos.slice(0, 3).map((pizza) => <CardItemHome key={pizza.id} {...pizza} />)}
        </div>
        <div className="py-10 flex justify-center">
          <Link href="/cardapio" className="animate-pulse-glow group flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition duration-300"><span>Ver Cardápio</span><GoArrowRight size={22} className="transition-transform duration-300 group-hover:translate-x-1" /></Link>
        </div>
      </section>
    </main>
  );
}

function CardCarousel() {
  return (
    <section className="relative py-10 bg-gradient-to-b from-orange-300 via-red-30 to-white">
      <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-6 px-6 sm:grid-cols-2 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.titulo} className="rounded-2xl bg-white p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-lg font-bold">{card.titulo}</h3>
            <p className="mt-2 text-gray-600">{card.subtitulo}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
