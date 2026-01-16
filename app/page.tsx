"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";


/* =========================
   HOME (default export)
   ========================= */
export default function Home() {
  return (
    <main>
      {/* HERO */}
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
              <Link
                href="/cardapio"
                className="rounded-lg bg-[hsl(33_100%_50%)] px-6 py-3 font-semibold text-black animate-pulse-glow"
              >
                Peça Agora
              </Link>

              <Link
                href="/contato"
                className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white hover:text-black transition animate-pulse-glow"
              >
                Conheça-nos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CARROSSEL */}
      <CardCarousel />
    </main>
  );
}

/* =========================
   CARROSSEL (export nomeado)
   ========================= */
export function CardCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const interval = setInterval(() => {
      const maxScroll =
        carousel.scrollWidth - carousel.clientWidth;

      if (carousel.scrollLeft >= maxScroll) {
        carousel.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12">
      <h2 className="mb-6 text-center text-3xl font-bold">
        Destaques
      </h2>

      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-hidden px-6"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[250px] rounded-lg bg-white p-4 shadow"
          >
            Card {i + 1}
          </div>
        ))}
      </div>
    </section>
  );
}