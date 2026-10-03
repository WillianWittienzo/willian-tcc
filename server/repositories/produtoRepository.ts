import { prisma } from "@/lib/prisma";
import { Categoria, NomeTamanho } from "@/app/generated/prisma/client";

type ProdutoData = {
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

  async criar(data: ProdutoData) {
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
  async atualizar(id: number, data: ProdutoData) {
    return prisma.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        categoria: data.categoria,
        description: data.description,
        image: data.image,
        tamanhos: {
          upsert: data.tamanhos.map((tamanho) => ({
            where: {
              produtoId_nome: { produtoId: id, nome: tamanho.nome },
            },
            update: { preco: tamanho.preco, ordem: tamanho.ordem },
            create: tamanho,
          })),
        },
      },
      include: {
        tamanhos: { orderBy: { ordem: "asc" } },
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
