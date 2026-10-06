import type { Card, Categoria } from "@/components/data/cardapio";

type CriarProdutoData = {
  nome: string;
  description: string;
  categoria: Categoria;
  image: string;
  descontoPercentual: number | null;
  tamanhos: {
    nome: "Pequena" | "Média" | "Grande";
    preco: number;
  }[];
};

async function erroDaResposta(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  return new Error(data?.erro ?? fallback);
}

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
    throw await erroDaResposta(response, "Erro ao cadastrar produto");
  }

  return response.json();

}

export async function excluirProduto(id: number): Promise<void> {
  const response = await fetch(`/api/produtos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await erroDaResposta(response, "Erro ao excluir produto");
  }
}

export async function atualizarProduto(
  id: number,
  data: CriarProdutoData
): Promise<Card> {
  const response = await fetch(`/api/produtos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await erroDaResposta(response, "Erro ao atualizar produto");
  }

  return response.json();
}
