import Image from "next/image";

type CardItemProps = {
  nome: string;
  descricao: string;
  preco: number;
  image: string;

};

export default function CardItem({ nome, preco, descricao, image}: CardItemProps) {
  return (
    <div className="rounded-lg border p-6 shadow-sm">
      <Image
        src={image}
        alt={nome}
        width={600}
        height={300}
        className="rounded-md"
      />
      <h2 className="text-xl font-semibold">{nome}</h2>
      <p className="mt-2 text-zinc-100">{descricao}</p>
      <span className="mt-4 block font-bold">
        R$ {preco}
      </span>
    </div>
  );
}
