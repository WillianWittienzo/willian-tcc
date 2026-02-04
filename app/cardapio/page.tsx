import { CardList } from "@/components/cardapio/CardList";
import { cardapio } from "@/components/data/cardapio";

export default function CardapioPage() {
  return (
    <main className="mx-auto max-w-5xl py-20 px-6">
      <h1 className="mb-10 text-3xl font-bold">Cardápio</h1>
      <CardList items={cardapio} />
    </main>
    
  );
}
