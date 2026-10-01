import type { Card, Categoria } from "@/components/data/cardapio";

type CriarProdutoData = {
  nome: string;
  description: string;
  categoria: Categoria;
  image: string;
  tamanhos: {
    nome: "Pequena" | "Média" | "Grande";
    preco: number;
  }[];
};

export async function listarProdutos(): Promise<Card[]> {
  const response = await fetch("/api/produtos");

  if (!response.ok) {
    throw new Error("Erro ao buscar produtos");
  }

  return response.json();
}

export async function criarProduto(
  data: CriarProdutoData
): Promise<Card> {
  const response = await fetch("/api/produtos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao cadastrar produto");
  }

  return response.json();

}

export async function excluirProduto(id: number): Promise<void> {
  const response = await fetch(`/api/produtos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir produto");
  }
}