import { Categoria, NomeTamanho } from "@/app/generated/prisma/client";
import { aplicarDesconto, CATEGORIAS, TAMANHOS } from "@/lib/catalogo";
import { produtoRepository } from "@/server/repositories/produtoRepository";

type TamanhoEntrada = { nome: (typeof TAMANHOS)[number]; preco: number };
type ProdutoValidado = {
  nome: string;
  categoria: Categoria;
  description: string;
  image?: string;
  descontoPercentual: number | null;
  tamanhos: TamanhoEntrada[];
};

export class ProdutoInvalidoError extends Error {}
export class ProdutoNaoEncontradoError extends Error {}

function imagemValida(image: string) {
  if (image.startsWith("/") && !image.startsWith("//")) return true;
  try {
    return new URL(image).protocol === "https:";
  } catch {
    return false;
  }
}

function validarProduto(data: unknown, permitirImagemVazia = false): ProdutoValidado {
  if (typeof data !== "object" || data === null) {
    throw new ProdutoInvalidoError("Dados do produto inválidos");
  }

  const nome = "nome" in data && typeof data.nome === "string" ? data.nome.trim() : "";
  const description = "description" in data && typeof data.description === "string" ? data.description.trim() : "";
  const image = "image" in data && typeof data.image === "string" ? data.image.trim() : "";
  const categoria = "categoria" in data ? data.categoria : null;
  const desconto = "descontoPercentual" in data ? data.descontoPercentual : null;
  const tamanhos = "tamanhos" in data ? data.tamanhos : null;

  if (nome.length < 2 || nome.length > 80) {
    throw new ProdutoInvalidoError("O nome deve ter entre 2 e 80 caracteres");
  }
  if (description.length < 5 || description.length > 500) {
    throw new ProdutoInvalidoError("A descrição deve ter entre 5 e 500 caracteres");
  }
  if (!CATEGORIAS.includes(categoria as (typeof CATEGORIAS)[number])) {
    throw new ProdutoInvalidoError("Categoria inválida");
  }
  if ((!permitirImagemVazia || image) && (!image || image.length > 500 || !imagemValida(image))) {
    throw new ProdutoInvalidoError("Informe uma imagem local ou uma URL HTTPS válida");
  }
  if (desconto !== null && (!Number.isInteger(desconto) || Number(desconto) < 1 || Number(desconto) > 90)) {
    throw new ProdutoInvalidoError("O desconto deve ser um inteiro entre 1 e 90");
  }
  if (!Array.isArray(tamanhos) || tamanhos.length !== TAMANHOS.length) {
    throw new ProdutoInvalidoError("Informe os três tamanhos da pizza");
  }

  const tamanhosValidados = tamanhos.map((tamanho) => {
    if (typeof tamanho !== "object" || tamanho === null) {
      throw new ProdutoInvalidoError("Tamanho inválido");
    }
    const nomeTamanho = "nome" in tamanho ? tamanho.nome : null;
    const preco = "preco" in tamanho ? tamanho.preco : null;
    if (!TAMANHOS.includes(nomeTamanho as TamanhoEntrada["nome"]) || typeof preco !== "number" || !Number.isFinite(preco) || preco <= 0 || preco > 10000) {
      throw new ProdutoInvalidoError("Nome ou preço de tamanho inválido");
    }
    return { nome: nomeTamanho as TamanhoEntrada["nome"], preco: Math.round(preco * 100) / 100 };
  });

  if (new Set(tamanhosValidados.map((tamanho) => tamanho.nome)).size !== TAMANHOS.length) {
    throw new ProdutoInvalidoError("Os tamanhos não podem se repetir");
  }

  return {
    nome,
    description,
    categoria: categoria as Categoria,
    image: image || undefined,
    descontoPercentual: desconto === null ? null : Number(desconto),
    tamanhos: tamanhosValidados,
  };
}

function converterTamanho(nome: TamanhoEntrada["nome"]) {
  return nome === "Média" ? NomeTamanho.Media : NomeTamanho[nome];
}

function formatarProduto(produto: Awaited<ReturnType<typeof produtoRepository.criar>>) {
  const descontoPercentual = produto.descontoPercentual;
  return {
    id: produto.id,
    nome: produto.nome,
    categoria: produto.categoria,
    description: produto.description,
    image: produto.image,
    descontoPercentual,
    tamanhos: produto.tamanhos.map((tamanho) => {
      const preco = Number(tamanho.preco);
      return {
        nome: tamanho.nome === "Media" ? "Média" : tamanho.nome,
        preco,
        precoPromocional: descontoPercentual === null ? null : aplicarDesconto(preco, descontoPercentual),
      };
    }),
  };
}

function tamanhosParaBanco(tamanhos: TamanhoEntrada[]) {
  return [...tamanhos]
    .sort((a, b) => TAMANHOS.indexOf(a.nome) - TAMANHOS.indexOf(b.nome))
    .map((tamanho, index) => ({ nome: converterTamanho(tamanho.nome), preco: tamanho.preco, ordem: index + 1 }));
}

export const produtoService = {
  async listarTodos() {
    return (await produtoRepository.listarTodos()).map(formatarProduto);
  },

  async criar(data: unknown) {
    const produto = validarProduto(data);
    return formatarProduto(await produtoRepository.criar({
      ...produto,
      image: produto.image!,
      tamanhos: tamanhosParaBanco(produto.tamanhos),
    }));
  },

  async atualizar(id: number, data: unknown) {
    if (!Number.isInteger(id) || id <= 0) throw new ProdutoInvalidoError("ID do produto inválido");
    const atual = await produtoRepository.buscarPorId(id);
    if (!atual) throw new ProdutoNaoEncontradoError("Produto não encontrado");
    const produto = validarProduto(data, true);
    return formatarProduto(await produtoRepository.atualizar(id, {
      ...produto,
      image: produto.image ?? atual.image,
      tamanhos: tamanhosParaBanco(produto.tamanhos),
    }));
  },

  async excluir(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new ProdutoInvalidoError("ID do produto inválido");
    if (!(await produtoRepository.buscarPorId(id))) throw new ProdutoNaoEncontradoError("Produto não encontrado");
    return produtoRepository.excluir(id);
  },
};
