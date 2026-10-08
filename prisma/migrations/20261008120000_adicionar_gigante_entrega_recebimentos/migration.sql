-- Amplia o enum sem criar preços: cada produto só oferece Gigante quando possuir ProdutoTamanho.
ALTER TYPE "NomeTamanho" ADD VALUE 'Gigante';

CREATE TYPE "MetodoEntrega" AS ENUM ('Entrega', 'Retirada');
CREATE TYPE "FormaPagamento" AS ENUM ('Dinheiro', 'Cartao', 'Pix', 'Boleto');
CREATE TYPE "StatusRecebimento" AS ENUM ('Pendente', 'Pago', 'Falhou');

-- Opcional para preservar pedidos históricos sem inventar o método utilizado.
ALTER TABLE "Pedido" ADD COLUMN "metodoEntrega" "MetodoEntrega";

-- Não há backfill: recebimentos antigos permanecem como não registrados.
CREATE TABLE "Recebimento" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "status" "StatusRecebimento" NOT NULL DEFAULT 'Pendente',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Recebimento_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Recebimento_pedidoId_key" ON "Recebimento"("pedidoId");
CREATE INDEX "Recebimento_status_idx" ON "Recebimento"("status");
CREATE INDEX "Recebimento_criadoEm_idx" ON "Recebimento"("criadoEm");

ALTER TABLE "Recebimento"
ADD CONSTRAINT "Recebimento_pedidoId_fkey"
FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
