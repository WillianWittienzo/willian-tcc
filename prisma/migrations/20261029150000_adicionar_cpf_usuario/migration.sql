ALTER TABLE "Usuario"
ADD COLUMN "cpf" VARCHAR(11);

CREATE UNIQUE INDEX "Usuario_cpf_key"
ON "Usuario"("cpf");
