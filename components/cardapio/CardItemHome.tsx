import Image from "next/image";


type CardItemProps = {
  nome: string;
  descricao: string;
  preco: number;
  image: string;

};
export function CardItemHome({ nome,  descricao, preco, image }:  CardItemProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <Image src={image} alt={nome} width={160} height={160} />
      <h3 className="mt-2 text-lg font-bold">{nome}</h3>
      <p className="mt-2 text-zinc-100">{descricao}</p>
      <span className="text-[hsl(33_100%_50%)] font-semibold">
        R$ {preco}
      </span>
    </div>
  );
}
