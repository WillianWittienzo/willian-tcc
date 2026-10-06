import { Categoria, NomeTamanho } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type ProdutoData = {
  nome: string;
  categoria: Categoria;
  description: string;
  image: string;
  descontoPercentual: number | null;
  tamanhos: { nome: NomeTamanho; preco: number; ordem: number }[];
};

const incluirTamanhos = { tamanhos: { orderBy: { ordem: "asc" as const } } };

export const produtoRepository = {
  listarTodos() {
    return prisma.produto.findMany({ include: incluirTamanhos, orderBy: { id: "asc" } });
  },
  buscarPorId(id: number) {
    return prisma.produto.findUnique({ where: { id }, include: incluirTamanhos });
  },
  criar(data: ProdutoData) {
    return prisma.produto.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        description: data.description,
        image: data.image,
        descontoPercentual: data.descontoPercentual,
        tamanhos: { create: data.tamanhos },
      },
      include: incluirTamanhos,
    });
  },
  atualizar(id: number, data: ProdutoData) {
    return prisma.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        categoria: data.categoria,
        description: data.description,
        image: data.image,
        descontoPercentual: data.descontoPercentual,
        tamanhos: {
          upsert: data.tamanhos.map((tamanho) => ({
            where: { produtoId_nome: { produtoId: id, nome: tamanho.nome } },
            update: { preco: tamanho.preco, ordem: tamanho.ordem },
            create: tamanho,
          })),
        },
      },
      include: incluirTamanhos,
    });
  },
  excluir(id: number) {
    return prisma.produto.delete({ where: { id } });
  },
};
