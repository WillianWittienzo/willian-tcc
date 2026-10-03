import { produtoRepository } from "@/server/repositories/produtoRepository";
import { Categoria, NomeTamanho } from "@/app/generated/prisma/client";

type CriarProdutoData = {
  nome: string;
  categoria: Categoria;
  description: string;
  image: string;
  tamanhos: {
    nome: "Pequena" | "Média" | "Grande";
    preco: number;
  }[];
};

export const produtoService = {
  async listarTodos() {
    const produtos = await produtoRepository.listarTodos();

    return produtos.map((produto) => ({
      id: produto.id,
      nome: produto.nome,
      categoria: produto.categoria,
      description: produto.description,
      image: produto.image,

      tamanhos: produto.tamanhos.map((tamanho) => ({
        nome: tamanho.nome === "Media" ? "Média" : tamanho.nome,
        preco: Number(tamanho.preco),
      })),
    }));
  },

  async criar(data: CriarProdutoData) {
    const tamanhos = data.tamanhos.map((tamanho, index) => ({
      nome:
        tamanho.nome === "Média"
          ? NomeTamanho.Media
          : NomeTamanho[tamanho.nome],
      preco: tamanho.preco,
      ordem: index + 1,
    }));

    const produto = await produtoRepository.criar({
      nome: data.nome,
      categoria: data.categoria,
      description: data.description,
      image: data.image,
      tamanhos,
    });

    return {
      id: produto.id,
      nome: produto.nome,
      categoria: produto.categoria,
      description: produto.description,
      image: produto.image,

      tamanhos: produto.tamanhos.map((tamanho) => ({
        nome: tamanho.nome === "Media" ? "Média" : tamanho.nome,
        preco: Number(tamanho.preco),
      })),
    };
  },

  async atualizar(id: number, data: CriarProdutoData) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID do produto inválido");
    }

    const tamanhos = data.tamanhos.map((tamanho, index) => ({
      nome:
        tamanho.nome === "Média"
          ? NomeTamanho.Media
          : NomeTamanho[tamanho.nome],
      preco: tamanho.preco,
      ordem: index + 1,
    }));

    const produto = await produtoRepository.atualizar(id, {
      nome: data.nome,
      categoria: data.categoria,
      description: data.description,
      image: data.image,
      tamanhos,
    });

    return {
      id: produto.id,
      nome: produto.nome,
      categoria: produto.categoria,
      description: produto.description,
      image: produto.image,
      tamanhos: produto.tamanhos.map((tamanho) => ({
        nome: tamanho.nome === "Media" ? "Média" : tamanho.nome,
        preco: Number(tamanho.preco),
      })),
    };
  },

  async excluir(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID do produto inválido");
    }

    return produtoRepository.excluir(id);
  },
};
