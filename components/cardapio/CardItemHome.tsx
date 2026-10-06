import Image from "next/image";

import type { Card } from "../data/cardapio";


export function CardItemHome({ nome, categoria, tamanhos, image, description, descontoPercentual }: Card) {
  const menorTamanho = tamanhos[0];
  return (
    <div className="rounded-xl bg-white p-4 shadow relative hover:-translate-y-1 transition-all duration-200
 ">
  <div className="relative h-64 w-full"><Image src={image} alt={nome} fill unoptimized={image.startsWith("http")} sizes="(max-width: 768px) 100vw, 33vw" className="rounded-sm object-cover"/></div>
      
      <div className="absolute top-5 left-5 bg-red-800/90 backdrop-blur-sm rounded-lg px-3 py-1 ">
        <p className="text-[13px] text-white leading-none">
          {categoria}
        </p>
      </div>
      {descontoPercentual !== null && <span className="absolute right-5 top-5 rounded-lg bg-amber-500 px-3 py-1 text-sm font-bold">-{descontoPercentual}%</span>}
      <h3 className="mt-2 text-lg font-bold">{nome}</h3>

      <p className="mt-2 text-black">{description}</p>
      {menorTamanho?.precoPromocional !== null && menorTamanho && <span className="mr-2 text-sm text-gray-500 line-through">R$ {menorTamanho.preco.toFixed(2)}</span>}
      <span className="text-[hsl(33_100%_50%)] font-semibold">R$ {(menorTamanho?.precoPromocional ?? menorTamanho?.preco ?? 0).toFixed(2)}</span>
    </div>
  );
}

