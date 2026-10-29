-- Produtos atuais continuam disponíveis; pedidos e itens históricos não são alterados.
ALTER TABLE "Produto"
ADD COLUMN "disponivel" BOOLEAN NOT NULL DEFAULT true;
