import { Card } from "@/components/data/cardapio";
import { CardItemHome } from "./CardItemHome";
import { cardapio } from "@/components/data/cardapio";


export function CardListHome({ items }: { items: Card[] }) {
  return (
    <div className="flex gap-6 overflow-x-auto">
      {cardapio.slice(0, 3).map((item) => (
  <CardItemHome key={item.id} {...item} />
))}

    </div>
  );
}
