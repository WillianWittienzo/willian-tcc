import type { CategoriaProduto, TamanhoProduto } from "@/lib/catalogo";

export type Categoria = CategoriaProduto;

export type Tamanho = {
  nome: TamanhoProduto;
  preco: number;
  precoPromocional: number | null;
};

export type Card = {
  id: number;
  nome: string;
  categoria: Categoria;
  description: string;
  image: string;
  descontoPercentual: number | null;
  tamanhos: Tamanho[];
};

// Conteúdo institucional da Home, não é mock de produtos.
export const cards = [
  {
    titulo: "Forno a Lenha",
    subtitulo: "Pizzas assadas no forno a lenha tradicional",
  },
  {
    titulo: "Delivery Grátis",
    subtitulo: "Para pedidos acima de R$ 80",
  },
  {
    titulo: "Entrega Rápida",
    subtitulo: "Sua pizza em até 45 minutos",
  },
];
