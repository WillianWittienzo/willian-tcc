import CardItem from "./CardItem";
import { cardapio} from "@/components/data/cardapio";

export default function CardList(){
  return(
    <div className="grid gap-6 md:grid-cols-3">
      {cardapio.map((item) =>(
          <CardItem
          key={item.nome}
          nome={item.nome}
          preco={item.preco}
          descricao={item.descricao}
          />
      ))}
    </div>
  );
}