import { Card, cardapio } from "../data/cardapio";
import Image from "next/image";
import {CardItem} from "./CardItem";

type CardListProps = {
  items: Card[];
};

export function CardList({ items }: CardListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <CardItem
          key={item.id}
          id={item.id} 
          nome={item.nome}
          categoria={item.categoria}
          tamanhos={item.tamanhos}
          image={item.image}
          description={item.description}
        />
      ))}
    </div>
  );
}