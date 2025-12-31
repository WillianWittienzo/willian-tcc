type CardItemProps = {
  nome: string;
  descricao: string;
  preco: number;
};

export default function CardItem({ nome, descricao, preco }: CardItemProps) {
  return (
    <div className="rounded-lg border p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{nome}</h2>
      <p className="mt-2 text-zinc-600">{descricao}</p>
      <span className="mt-4 block font-bold">
        R$ {preco.toFixed(2)}
      </span>
    </div>
  );
}
