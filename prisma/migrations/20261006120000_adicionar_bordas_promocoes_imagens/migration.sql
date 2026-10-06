-- Promoção simples vinculada ao produto.
ALTER TABLE "Produto" ADD COLUMN "descontoPercentual" INTEGER;

ALTER TABLE "Produto"
ADD CONSTRAINT "Produto_descontoPercentual_check"
CHECK ("descontoPercentual" IS NULL OR "descontoPercentual" BETWEEN 1 AND 90);

-- A borda é opcional para manter pedidos históricos anteriores à funcionalidade.
CREATE TYPE "NomeBorda" AS ENUM ('Catupiry', 'Cheddar');

ALTER TABLE "ItemPedido"
ADD COLUMN "borda" "NomeBorda",
ADD COLUMN "precoBorda" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Migra somente as referências conhecidas das pizzas iniciais.
UPDATE "Produto" SET "image" = '/pizzas/margherita.jpg' WHERE "nome" = 'Margherita';
UPDATE "Produto" SET "image" = '/pizzas/calabresa.jpg' WHERE "nome" = 'Calabresa';
UPDATE "Produto" SET "image" = '/pizzas/quatro-queijos.jpg' WHERE "nome" = 'Quatro Queijos';
UPDATE "Produto" SET "image" = '/pizzas/portuguesa.jpg' WHERE "nome" = 'Portuguesa';
UPDATE "Produto" SET "image" = '/pizzas/frango-catupiry.jpg' WHERE "nome" = 'Frango com Catupiry';
UPDATE "Produto" SET "image" = '/pizzas/pepperoni.jpg' WHERE "nome" = 'Pepperoni';
UPDATE "Produto" SET "image" = '/pizzas/chocolate-morango.jpg' WHERE "nome" = 'Chocolate com Morango';
UPDATE "Produto" SET "image" = '/pizzas/banana-canela.jpg' WHERE "nome" = 'Banana com Canela';
UPDATE "Produto" SET "image" = '/pizzas/romeu-julieta.jpg' WHERE "nome" = 'Romeu e Julieta';
