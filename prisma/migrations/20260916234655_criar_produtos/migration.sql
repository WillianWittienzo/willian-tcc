-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('Tradicional', 'Especial', 'Doce');

-- CreateEnum
CREATE TYPE "NomeTamanho" AS ENUM ('Pequena', 'Media', 'Grande');

-- CreateTable
CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoTamanho" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "nome" "NomeTamanho" NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "ProdutoTamanho_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProdutoTamanho_produtoId_nome_key" ON "ProdutoTamanho"("produtoId", "nome");

-- AddForeignKey
ALTER TABLE "ProdutoTamanho" ADD CONSTRAINT "ProdutoTamanho_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
