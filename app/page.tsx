"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cards } from "@/components/data/cardapio";
import { cardapio } from "@/components/data/cardapio";
import { CardItemHome } from "@/components/cardapio/CardItemHome";



export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&h=1080&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-red-950 opacity-65" />

        <div className="container relative z-10 py-20 md:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white">
              PIZZAS QUE<br />
              <span className="text-[hsl(33_100%_50%)]">
                AQUECEM A ALMA
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/80">
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
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 md:grid-cols-3 bg-[hsl(30_20%_94%)]">
          {cardapio.slice(0, 3).map((pizza) => (
            <CardItemHome
              key={pizza.id}
              nome={pizza.nome}
              descricao={pizza.descricao}
              description={pizza.description}
              preco={pizza.preco}
              image={pizza.image}
            />
          ))}
        </div>
      </section>
    </main>

  );
}

export function CardCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const interval = setInterval(() => {
      const maxScroll =
        carousel.scrollWidth - carousel.clientWidth;

      if (carousel.scrollLeft + 300 >= maxScroll) {
        carousel.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: 300, behavior: "smooth" });
      }

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (

    // bg-[hsl(30_20%_94%)]
    <section className="relative py-5 bg-gray-100">
      <div
        ref={carouselRef}
        className="relative z-20 mx-auto -mt-12 max-w-800px  rounded-2xl bg-black/5 backdrop-blur-md shadow-xl px-6 py-8 flex gap-6 overflow-x-hidden ">

        {cards.map((card, i) => (
          <div
            key={i}
            className="min-w-250px rounded-lg p-10 shadow-sm"
          >
            <h3 className="text-lg font-bold ">
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
