CREATE TYPE "TipoTokenConta" AS ENUM ('VerificacaoEmail', 'RecuperacaoSenha');

ALTER TABLE "Usuario"
ADD COLUMN "emailVerificadoEm" TIMESTAMP(3);

UPDATE "Usuario"
SET "emailVerificadoEm" = CURRENT_TIMESTAMP;

CREATE TABLE "TokenConta" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipo" "TipoTokenConta" NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TokenConta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TokenConta_tokenHash_key" ON "TokenConta"("tokenHash");
CREATE INDEX "TokenConta_usuarioId_tipo_idx" ON "TokenConta"("usuarioId", "tipo");
CREATE INDEX "TokenConta_expiraEm_idx" ON "TokenConta"("expiraEm");

ALTER TABLE "TokenConta"
ADD CONSTRAINT "TokenConta_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
