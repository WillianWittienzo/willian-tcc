import type { Card } from "../data/cardapio";
import {CardItem} from "./CardItem";

type CardListProps = {
  items: Card[];
};

export function CardList({ items }: CardListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-amber-400 bg-amber-50 p-10 text-center">
        <p className="text-xl font-bold text-amber-950">Nenhuma pizza encontrada</p>
        <p className="mt-2 text-sm text-amber-900">Não há pizzas nesta categoria no momento. Experimente outro filtro.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <CardItem key={item.id} {...item} />
      ))}
    </div>
  );
}
