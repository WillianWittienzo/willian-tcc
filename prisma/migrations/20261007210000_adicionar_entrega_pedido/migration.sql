-- Campos opcionais preservam os pedidos históricos criados antes do checkout convidado.
ALTER TABLE "Pedido"
ADD COLUMN "nomeCliente" VARCHAR(100),
ADD COLUMN "telefone" VARCHAR(11),
ADD COLUMN "cep" VARCHAR(8),
ADD COLUMN "rua" VARCHAR(150),
ADD COLUMN "numero" VARCHAR(20),
ADD COLUMN "bairro" VARCHAR(100),
ADD COLUMN "complemento" VARCHAR(150),
ADD COLUMN "referencia" VARCHAR(200);

CREATE INDEX "Pedido_criadoEm_idx" ON "Pedido"("criadoEm");
CREATE INDEX "Pedido_status_criadoEm_idx" ON "Pedido"("status", "criadoEm");
CREATE INDEX "Pedido_telefone_idx" ON "Pedido"("telefone");
