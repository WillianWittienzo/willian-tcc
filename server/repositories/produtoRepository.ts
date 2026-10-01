import { prisma } from "@/lib/prisma";
import { Categoria, NomeTamanho } from "@/app/generated/prisma/client";

type CriarProdutoData = {
  nome: string;
  categoria: Categoria;
  description: string;
  image: string;
  tamanhos: {
    nome: NomeTamanho;
    preco: number;
    ordem: number;
  }[];
};

export const produtoRepository = {
  async listarTodos() {
    return prisma.produto.findMany({
      include: {
        tamanhos: {
          orderBy: {
            ordem: "asc",
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  },

  async criar(data: CriarProdutoData) {
    return prisma.produto.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        description: data.description,
        image: data.image,

        tamanhos: {
          create: data.tamanhos,
        },
      },

      include: {
        tamanhos: {
          orderBy: {
            ordem: "asc",
          },
        },
      },
    });
  },
  async excluir(id: number) {
    return prisma.produto.delete({
      where: {
        id,
      },
    });
  },
};