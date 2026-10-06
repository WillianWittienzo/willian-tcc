import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Categoria,
  NomeTamanho,
} from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const produtos = [
  {
    nome: "Margherita",
    description: "Molho de tomate, mussarela fresca, manjericão e azeite",
    categoria: Categoria.Tradicional,
    image: "/pizzas/margherita.jpg",
    tamanhos: [
      { nome: NomeTamanho.Pequena, preco: 35.44, ordem: 1 },
      { nome: NomeTamanho.Media, preco: 42.9, ordem: 2 },
      { nome: NomeTamanho.Grande, preco: 55.95, ordem: 3 },
    ],
  },
  {
    nome: "Calabresa",
    description: "Calabresa fatiada, cebola, mussarela e orégano",
    categoria: Categoria.Tradicional,
    image: "/pizzas/calabresa.jpg",
    tamanhos: [
      { nome: NomeTamanho.Pequena, preco: 35.44, ordem: 1 },
      { nome: NomeTamanho.Media, preco: 42.9, ordem: 2 },
      { nome: NomeTamanho.Grande, preco: 55.95, ordem: 3 },
    ],
  },
  {
    nome: "Quatro Queijos",
    description: "Mussarela, provolone, gorgonzola e parmesão",
    categoria: Categoria.Especial,
    image: "/pizzas/quatro-queijos.jpg",
    tamanhos: [
      { nome: NomeTamanho.Pequena, preco: 36.45, ordem: 1 },
      { nome: NomeTamanho.Media, preco: 44.9, ordem: 2 },
      { nome: NomeTamanho.Grande, preco: 58.95, ordem: 3 },
    ],
  },
  {
    nome: "Portuguesa",
    description: "Presunto, ovos, cebola, azeitonas, mussarela e ervilha",
    categoria: Categoria.Tradicional,
    image: "/pizzas/portuguesa.jpg",
    tamanhos: [
      { nome: NomeTamanho.Pequena, preco: 35.44, ordem: 1 },
      { nome: NomeTamanho.Media, preco: 42.9, ordem: 2 },
      { nome: NomeTamanho.Grande, preco: 55.95, ordem: 3 },
    ],
  },
  {
    nome: "Frango com Catupiry",
    description: "Frango desfiado, catupiry, mussarela e milho",
    categoria: Categoria.Especial,
    image: "/pizzas/frango-catupiry.jpg",
    tamanhos: [
      { nome: NomeTamanho.Pequena, preco: 36.45, ordem: 1 },
      { nome: NomeTamanho.Media, preco: 44.9, ordem: 2 },
      { nome: NomeTamanho.Grande, preco: 58.95, ordem: 3 },
    ],
  },
  {
    nome: "Pepperoni",
    description: "Pepperoni artesanal, mussarela e molho especial",
    categoria: Categoria.Especial,
    image: "/pizzas/pepperoni.jpg",
    tamanhos: [
      { nome: NomeTamanho.Pequena, preco: 36.45, ordem: 1 },
      { nome: NomeTamanho.Media, preco: 44.9, ordem: 2 },
      { nome: NomeTamanho.Grande, preco: 58.95, ordem: 3 },
    ],
  },
  {
    nome: "Chocolate com Morango",
    description: "Chocolate ao leite, morangos frescos e granulado",
    categoria: Categoria.Doce,
    image: "/pizzas/chocolate-morango.jpg",
    tamanhos: [
      { nome: NomeTamanho.Pequena, preco: 30.99, ordem: 1 },
      { nome: NomeTamanho.Media, preco: 40.99, ordem: 2 },
      { nome: NomeTamanho.Grande, preco: 50.95, ordem: 3 },
    ],
  },
  {
    nome: "Banana com Canela",
    description: "Banana caramelizada, canela, leite condensado e açúcar",
    categoria: Categoria.Doce,
    image: "/pizzas/banana-canela.jpg",
    tamanhos: [
      { nome: NomeTamanho.Pequena, preco: 35.44, ordem: 1 },
      { nome: NomeTamanho.Media, preco: 42.9, ordem: 2 },
      { nome: NomeTamanho.Grande, preco: 55.95, ordem: 3 },
    ],
  },
  {
    nome: "Romeu e Julieta",
    description: "Goiabada cremosa, queijo minas derretido",
    categoria: Categoria.Doce,
    image: "/pizzas/romeu-julieta.jpg",
    tamanhos: [
      { nome: NomeTamanho.Pequena, preco: 35.44, ordem: 1 },
      { nome: NomeTamanho.Media, preco: 42.9, ordem: 2 },
      { nome: NomeTamanho.Grande, preco: 55.95, ordem: 3 },
    ],
  },
];

async function main() {
  console.log("Iniciando seed...");

  for (const produto of produtos) {
    const existente = await prisma.produto.findFirst({ where: { nome: produto.nome } });
    if (!existente) {
      await prisma.produto.create({
        data: {
          nome: produto.nome,
          description: produto.description,
          categoria: produto.categoria,
          image: produto.image,
          tamanhos: { create: produto.tamanhos },
        },
      });
    }
  }

  console.log("Produtos iniciais ausentes cadastrados com sucesso!");
}

main()
  .catch((erro) => {
    console.error("Erro ao executar seed:", erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
