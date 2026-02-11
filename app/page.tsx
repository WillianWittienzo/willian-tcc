"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cards } from "@/components/data/cardapio";
import { cardapio } from "@/components/data/cardapio";
import { CardItemHome } from "@/components/cardapio/CardItemHome";
import Image from "next/image";



export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&h=1080&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-red-950 opacity-65" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">

          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white">
              PIZZAS QUE<br />
              <span className="text-[hsl(33_100%_50%)]">
                AQUECEM A ALMA
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/80 items-center ">
              Experimente o sabor autêntico das nossas pizzas artesanais,
              feitas com ingredientes frescos e muito carinho.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link href="/cardapio" className="rounded-lg bg-[hsl(33_100%_50%)] px-6 py-3 font-semibold text-black animate-pulse-glow">Peça Agora</Link>

              <Link href="/contato" className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white hover:text-black transition animate-pulse-glow">Conheça-nos</Link>
            </div>
          </div>
        </div>
      </section>
      <CardCarousel />

      <section >
        <div className="bg-[hsl(30deg_20%_94.12%)]">
          <h1 className=" text-[48px] text-black text-center -mt-">PIZZAS<span className="text-[hsl(33_100%_50%)]"><span></span> POPULARES</span>
          </h1>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 md:grid-cols-3 bg-[hsl(30_20%_94%)]  ">
          {cardapio.slice(0, 3).map((pizza) => (
            <Link href="/compra"><CardItemHome
              key={pizza.id}
              nome={pizza.nome}
              descricao={pizza.descricao}
              description={pizza.description}
              preco={pizza.preco}
              image={pizza.image}
            />
            </Link>

          ))}
        </div>

        <div className="py-10 flex justify-center">
          <Link
            href="/cardapio" className="group flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition duration-300"><span>Ver Cardápio</span>
            <Image
              src="/logo.png/arrow-right.png"
              alt="seta"
              width={18}
              height={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </main>


  );
}
export function CardCarousel() {
  return (
    <section className="relative py-10 bg-gray-100 ">
      <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-6 px-6 sm:grid-cols-2 md:grid-cols-3">

        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300s
"
          >
            <h3 className="text-lg font-bold">
              {card.titulo}
            </h3>

            <p className="mt-2 text-gray-600">
              {card.subtitulo}
            </p>
          </div>
        ))}

      </div>
    </section>
  );


}
