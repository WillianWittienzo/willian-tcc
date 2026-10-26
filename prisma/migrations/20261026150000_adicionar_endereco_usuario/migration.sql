-- Endereço único e opcional do cliente; pedidos anteriores mantêm suas cópias históricas.
ALTER TABLE "Usuario"
  ADD COLUMN "cep" VARCHAR(8),
  ADD COLUMN "rua" VARCHAR(150),
  ADD COLUMN "numero" VARCHAR(20),
  ADD COLUMN "bairro" VARCHAR(100),
  ADD COLUMN "complemento" VARCHAR(150),
  ADD COLUMN "referencia" VARCHAR(200);
