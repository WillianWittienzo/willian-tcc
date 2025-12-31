import CardItem from "./CardItem";
import { cardapio } from "../data/cardapio";

export default function CardList() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {cardapio.map((item) => (
        <CardItem
          key={item.id}
          nome={item.nome}
          descricao={item.descricao}
          preco={item.preco}
        />
      ))}
    </div>
  );
}
