import { CardList } from "@/components/cardapio/CardList";
import { cardapio } from "@/components/data/cardapio";

export default function CardapioPage() {
  return (
    
    <main className="mx-auto max-w-5xl py-20 px-6">
      <div className="mx-auto max-w-4xl py-20 px-6 -mt-4 bg-[hsl(0deg_83.78%_21.76%)]">
        <h1 className="text-6xl font-bold text-amber-50">Nosso <span className=" text-amber-500">Cardapio</span></h1>
        </div> 
      <h1 className="mb-10 text-3xl font-bold">Cardápio</h1>
      <CardList items={cardapio} />
      
    </main>
    
  );
}
