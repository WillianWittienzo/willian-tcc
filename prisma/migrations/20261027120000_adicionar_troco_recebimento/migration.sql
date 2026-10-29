-- Campos opcionais preservam recebimentos históricos, inclusive os que usam Boleto.
ALTER TABLE "Recebimento"
  ADD COLUMN "precisaTroco" BOOLEAN,
  ADD COLUMN "valorParaTroco" DECIMAL(10,2),
  ADD COLUMN "valorTroco" DECIMAL(10,2);
