import type { Card } from "../data/cardapio";
import {CardItem} from "./CardItem";

type CardListProps = {
  items: Card[];
};

export function CardList({ items }: CardListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <CardItem key={item.id} {...item} />
      ))}
    </div>
  );
}
