import Image from "next/image";

import { Categoria } from "../data/cardapio";


type CardItemHomeProps = {
  nome: string;
  categoria: Categoria;
  image: string;
  description:string;
  tamanhos: {
    nome: "Pequena" | "Média" | "Grande"
    preco: number
  }[]

};
export function CardItemHome({ nome, categoria, tamanhos, image, description }: CardItemHomeProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow relative hover:-translate-y-1 transition-all duration-200
 ">
  <div className="flex justify-center"><Image src={image} alt={nome} width={450} height={350} className="rounded-sm"/></div>
      
      <div className="absolute top-5 left-5 bg-red-800/90 backdrop-blur-sm rounded-lg px-3 py-1 ">
        <p className="text-[13px] text-white leading-none">
          {categoria}
        </p>
      </div>
      <h3 className="mt-2 text-lg font-bold">{nome}</h3>

      <p className="mt-2 text-black">{description}</p>
      <span className="text-[hsl(33_100%_50%)] font-semibold">
       R$ {tamanhos?.[0]?.preco?.toFixed(2) ?? "0.00"}
        
      </span>
    </div>
  );
}

