import { Card } from "@/components/data/cardapio";
import { CardItemHome } from "./CardItemHome";


export function CardListHome({ items }: { items: Card[] }) {
  return (
    <div className="flex gap-6 overflow-x-auto">
      {items.map((item) => (
        <CardItemHome key={item.id} {...item} />
      ))}
    </div>
  );
}
