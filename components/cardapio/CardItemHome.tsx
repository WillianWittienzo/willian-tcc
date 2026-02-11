import Image from "next/image";


type CardItemProps = {
  nome: string;
  descricao: string;
  description: string
  preco: number;
  image: string;

};
export function CardItemHome({nome,  descricao, preco, image, description}:  CardItemProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow relative hover:-translate-y-1 transition-all duration-200
 ">
      <Image src={image} alt={nome} width={350} height={300} className="rounded-sm"/>
      <div className="absolute top-5 left-5 bg-red-800/90 backdrop-blur-sm rounded-lg px-3 py-1 ">
    <p className="text-[13px] text-white leading-none">
      {descricao}
    </p>
  </div>
      <h3 className="mt-2 text-lg font-bold">{nome}</h3>
      
      <p className="mt-2 text-black">{ description}</p>
      <span className="text-[hsl(33_100%_50%)] font-semibold">
        R$ {preco.toFixed(2)}
      </span>
    </div>
  );
}
