export default function SobrePage() {
  return (
    <main className="py-20">
      <section >
        <div className="mx-auto max-w-8xl py-20 -mt-4 bg-[hsl(0deg_83.78%_21.76%)]">
          <h1 className="text-6xl font-bold text-amber-50 flex justify-center gap-2">
            Nosso<span className="text-amber-500">História</span>
          </h1>
          <p className="text-amber-50 flex justify-center text-sm">Conheça a Brasa Quente</p>
        </div>
      </section>
      <div className="mx-auto max-w-4xl max-w-[600px] py-10">
        <h1 className="text-4xl font-bold text-center">Sobre a Brasa Quente</h1>
        <p className=" text-zinc-600 py-8">
          A Brasa Quente nasceu do sonho de uma família apaixonada por pizzas. Há mais de 15 anos, começamos com um pequeno forno a lenha no quintal e hoje somos referência em qualidade e sabor na região.

          Nossas pizzas são preparadas artesanalmente, com massa feita diariamente e ingredientes selecionados. O segredo? Muito amor e dedicação em cada etapa do processo.
        </p>
      </div>
      <section className="bg-gray-100 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          <div className="text-center">
            <span className="font-display text-5xl text-primary md:text-6xl">5+</span>
            <p className="mt-2 text-muted-foreground">Anos de Experiência</p>
          </div>

          <div className="text-center">
            <span className="font-display text-5xl text-primary md:text-6xl">20k+</span>
            <p className="mt-2 text-muted-foreground">Pizzas Vendidas</p>
          </div>

          <div className="text-center">
            <span className="font-display text-5xl text-primary md:text-6xl">10k+</span>
            <p className="mt-2 text-muted-foreground">Clientes Felizes</p>
          </div>

          <div className="text-center">
            <span className="font-display text-5xl text-primary md:text-6xl">25+</span>
            <p className="mt-2 text-muted-foreground">Sabores Únicos</p>
          </div>

        </div>
      </section>
    </main>
  );
}
