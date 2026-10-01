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
    image:
      "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&h=500&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=500&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=500&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=500&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=500&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1481391032119-d89fee407e44?w=500&h=500&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&h=500&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&h=500&fit=crop",
    tamanhos: [
      { nome: NomeTamanho.Pequena, preco: 35.44, ordem: 1 },
      { nome: NomeTamanho.Media, preco: 42.9, ordem: 2 },
      { nome: NomeTamanho.Grande, preco: 55.95, ordem: 3 },
    ],
  },
];

async function main() {
  console.log("Iniciando seed...");

  // Deixa o seed repetível durante o desenvolvimento.
  await prisma.produtoTamanho.deleteMany();
  await prisma.produto.deleteMany();

  for (const produto of produtos) {
    await prisma.produto.create({
      data: {
        nome: produto.nome,
        description: produto.description,
        categoria: produto.categoria,
        image: produto.image,

        tamanhos: {
          create: produto.tamanhos,
        },
      },
    });
  }

  console.log("9 pizzas cadastradas com sucesso!");
}

main()
  .catch((erro) => {
    console.error("Erro ao executar seed:", erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });