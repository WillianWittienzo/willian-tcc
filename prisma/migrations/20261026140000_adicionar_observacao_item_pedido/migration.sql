-- Campo opcional para preservar observações por pizza sem alterar pedidos existentes.
ALTER TABLE "ItemPedido" ADD COLUMN "observacao" VARCHAR(200);
