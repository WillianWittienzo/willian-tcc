import Link from "next/link";


export default function Home() {
  return (
    <main>
      <h1>PIZZAS QUE</h1>
      <h1>AQUECEM A ALMA</h1>
      <p>Experimente o sabor autêntico das nossas pizzas artesanais, feitas com ingredientes frescos e muito carinho.</p>
      {/* BOTÕES */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/cardapio"
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition"
          >
            Ver Cardápio
          </Link>

          <Link
            href="/contato"
            className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white hover:text-black transition"
          >
            Contato
          </Link>
        </div>
    </main>
  );
}
