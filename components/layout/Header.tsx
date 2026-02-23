"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LuShoppingCart } from "react-icons/lu";
import { useCart } from "@/app/context/CartContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${
          scrolled
            ? "bg-zinc-800/70 backdrop-blur-md shadow-md"
            : "bg-zinc-800"
        }
      `}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-white">
        <div className="flex items-center gap-2">

          <Link href="/">
          <Image
            src="/logo.png/fogo3.png"
            alt="Brasa Quente"
            width={40}
            height={40}
          />
          </Link>

          <Link
            href="/"
            className="text-3xl font-bold tracking-widest uppercase text-red-600 hover:text-orange-500 transition"
          >
            Brasa Quente
          </Link>
        </div>

        {/* BOTÃO MOBILE */}
        <button
          className="flex flex-col gap-2 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span
            className={`h-0.5 w-8 bg-white transition ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`h-0.5 w-8 bg-white transition ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-8 bg-white transition ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>

        {/* MENU DESKTOP */}
        <ul className="hidden gap-8 md:flex text-[18px]">
          <li><Link href="/">Início</Link></li>
          <li><Link href="/cardapio">Cardápio</Link></li>
          <li><Link href="/sobre">Sobre</Link></li>
          <li><Link href="/contato">Contato</Link></li>
          <li><Link href="carrinho"><LuShoppingCart /></Link></li>
          <li><Link href="/login"className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-orange-500 transition">Entrar</Link></li>      
        </ul>
      </nav>

      {/* MENU MOBILE */}
      <ul
        className={`fixed right-0 top-16 h-screen w-1/2 bg-zinc-900 p-8 transition-transform md:hidden text-white 
          ${menuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <li className="mb-6"><Link href="/">Início</Link></li>
        <li className="mb-6"><Link href="/cardapio">Cardápio</Link></li>
        <li className="mb-6"><Link href="/sobre">Sobre</Link></li>
        <li className="mb-6"><Link href="/contato">Contato</Link></li>
        <li><Link href="/login" className="mb-6 text-red-600">Entrar</Link></li>
      </ul>
    </header>
  );
}
