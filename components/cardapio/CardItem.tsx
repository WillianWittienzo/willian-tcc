import Image from "next/image";
import { Categoria } from "../data/cardapio";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext"; 



type CardItemProps = {
  id: number;
  nome: string;
  categoria: Categoria;
  preco: number;
  image: string;
  description: string;

};

export function CardItem({ nome, preco, categoria, image, description, id }: CardItemProps) {

  const { addToCart } = useCart()
  return (
    <div className="rounded-xl bg-white p-4 shadow relative hover:-translate-y-1 transition-all duration-200
   ">
      <Image src={image} alt={nome} width={350} height={300} className="rounded-sm" />
      <div className="absolute top-5 left-5 bg-red-800/90 backdrop-blur-sm rounded-lg px-3 py-1 ">
        <p className="text-[13px] text-white leading-none">
          {categoria}
        </p>
      </div>
      <h3 className="mt-2 text-lg font-bold">{nome}</h3>
      <p className="mt-2 text-black">{description}</p>
      <div className="mt-4 flex items-center justify-between">

        <span className="text-[hsl(33_100%_50%)] font-semibold text-2xl">
          R$ {preco.toFixed(2)}
        </span>

        {/* <Link
          href="/carrinho"
          className="text-xs group flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition duration-300"
        >
          <span>Adicionar</span>
          <FaShoppingCart
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link> */}
        <button
          onClick={() =>
            addToCart({ id, nome, categoria, preco, image, description })
          }
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Adicionar
        </button>

      </div>
    </div>



  );
}
