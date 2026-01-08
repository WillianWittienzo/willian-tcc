import Link from "next/link";

export default function Header() {
  return (
    
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <strong className="text-xl">Brasa Quente</strong>

        <ul className="flex gap-6">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/cardapio">Cardápio</Link></li>
          <li><Link href="/sobre">Sobre</Link></li>
          <li><Link href="/contato">Contato</Link></li>
        </ul>
      </nav>
    </header>
    
  );
}
