"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuShoppingCart } from "react-icons/lu";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { criarUrlAutenticacao, obterRetornoCompra } from "@/lib/checkout";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, carregando, logout } = useAuth();
  const { items, abrirCarrinho } = useCart();
  const router = useRouter();
  const totalItems = items.reduce((total, item) => total + item.quantidade, 0);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function sair() {
    await logout();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function navegarComRetorno(event: MouseEvent<HTMLAnchorElement>, rota: "/login" | "/cadastro") {
    if (!obterRetornoCompra(window.location.search)) return;
    event.preventDefault();
    setMenuOpen(false);
    router.push(criarUrlAutenticacao(rota));
  }

  const linksConta = carregando ? (
    <li aria-label="Carregando sessão" className="h-10 w-24 animate-pulse rounded-lg bg-zinc-600" />
  ) : user?.papel === "Admin" ? (
    <>
      <li><Link href="/admin">Painel administrativo</Link></li>
      <li><button type="button" onClick={() => void sair()} className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-orange-500">Sair</button></li>
    </>
  ) : user ? (
    <>
      <li><Link href="/pedidos">Minhas Pizzas</Link></li>
      <li><button type="button" onClick={() => void sair()} className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-orange-500">Sair</button></li>
    </>
  ) : (
    <>
      <li><Link href="/cadastro" onClick={(event) => navegarComRetorno(event, "/cadastro")}>Cadastre-se</Link></li>
      <li><Link href="/login" onClick={(event) => navegarComRetorno(event, "/login")} className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-orange-500">Entrar</Link></li>
    </>
  );

  const linksContaMobile = carregando ? (
    <li aria-label="Carregando sessão" className="h-8 w-24 animate-pulse rounded bg-zinc-700" />
  ) : user?.papel === "Admin" ? (
    <>
      <li className="mb-6"><Link href="/admin">Painel administrativo</Link></li>
      <li><button type="button" onClick={() => void sair()} className="font-semibold text-red-500">Sair</button></li>
    </>
  ) : user ? (
    <>
      <li className="mb-6"><Link href="/pedidos">Minhas Pizzas</Link></li>
      <li><button type="button" onClick={() => void sair()} className="font-semibold text-red-500">Sair</button></li>
    </>
  ) : (
    <>
      <li className="mb-6"><Link href="/cadastro" onClick={(event) => navegarComRetorno(event, "/cadastro")}>Cadastre-se</Link></li>
      <li><Link href="/login" onClick={(event) => navegarComRetorno(event, "/login")} className="font-semibold text-red-500">Entrar</Link></li>
    </>
  );

  return (
    <header className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-zinc-800/70 shadow-md backdrop-blur-md" : "bg-zinc-800"}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 text-white sm:px-6" aria-label="Navegação principal">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" aria-label="Página inicial">
            <Image src="/logo.png/fogo3.png" alt="" width={40} height={40} />
          </Link>
          <Link href="/" className="truncate text-xl font-bold uppercase tracking-widest text-red-600 transition hover:text-orange-500 sm:text-3xl">
            Brasa Quente
          </Link>
        </div>

        <button
          type="button"
          className="flex flex-col gap-2 md:hidden"
          onClick={() => setMenuOpen((aberto) => !aberto)}
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <span className={`h-0.5 w-8 bg-white transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-8 bg-white transition ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-8 bg-white transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>

        <ul className="hidden items-center gap-5 text-sm lg:gap-7 lg:text-base md:flex">
          <li><Link href="/">Início</Link></li>
          <li><Link href="/cardapio">Cardápio</Link></li>
          <li><Link href="/sobre">Sobre</Link></li>
          <li><Link href="/contato">Contato</Link></li>
          <li><Link href="/acompanhar-pedido">Acompanhar pedido</Link></li>
          <li>
            <button type="button" onClick={abrirCarrinho} className="relative block" aria-label={`Carrinho com ${totalItems} item(ns)`}>
              <LuShoppingCart size={22} className={totalItems > 0 ? "text-red-500" : "text-white"} />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">{totalItems}</span>
              )}
            </button>
          </li>
          {linksConta}
        </ul>
      </nav>

      <ul
        id="menu-mobile"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
        }}
        className={`fixed right-0 top-16 h-[calc(100vh-4rem)] w-72 max-w-[85vw] overflow-y-auto bg-zinc-900 p-8 text-white shadow-xl transition-transform md:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <li className="mb-6"><Link href="/">Início</Link></li>
        <li className="mb-6"><Link href="/cardapio">Cardápio</Link></li>
        <li className="mb-6"><Link href="/sobre">Sobre</Link></li>
        <li className="mb-6"><Link href="/contato">Contato</Link></li>
        <li className="mb-6"><Link href="/acompanhar-pedido">Acompanhar pedido</Link></li>
        <li className="mb-6">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              abrirCarrinho();
            }}
            className="flex items-center gap-2"
          >
            <LuShoppingCart size={20} /> Carrinho {totalItems > 0 && `(${totalItems})`}
          </button>
        </li>
        {linksContaMobile}
      </ul>
    </header>
  );
}
