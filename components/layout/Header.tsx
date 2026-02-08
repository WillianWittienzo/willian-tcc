"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";


export default function Header() {
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
        fixed top-0 left-0 w-full z-50 transition-all duration-300 rounded-2x
        ${scrolled
          ? "bg-white/70 backdrop-blur-md shadow-md"
          : "bg-white"}
      `}
    >
     <nav className="mx-auto flex max-w-6xl items-center px-8 py-4">

  {/* ESQUERDA: logo + menu */}
  <div className="flex items-center gap-16">
    {/* Logo */}
    <div className="flex items-center gap-5">
      <Image
        src="/logo.png/fogo1.png"
        alt="Brasa Quente"
        width={40}
        height={40}
      />
      <span className="font-display text-3xl tracking-wide text-red-700 whitespace-nowrap">
  BRASA QUENTE
</span>

    </div>

    {/* Menu */}
    <ul className="flex gap-10 text-[18px] ml-100">
      <li><Link href="/">Início</Link></li>
      <li><Link href="/cardapio">Cardápio</Link></li>
      <li><Link href="/sobre">Sobre</Link></li>
      <li><Link href="/contato">Contato</Link></li>
    </ul>
  </div>

  {/* DIREITA: botão */}
  <Link
    href="/compra"
    className="ml-18 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-orange-500 transition"
  >
    Compra
  </Link>

</nav>



    </header>
  );
}
