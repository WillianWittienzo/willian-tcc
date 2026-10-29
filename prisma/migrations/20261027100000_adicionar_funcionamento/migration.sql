-- Configuração única e horários semanais. O padrão 00:00–00:00 representa 24 horas
-- para preservar o funcionamento atual até que o administrador configure a pizzaria.
CREATE TABLE "ConfiguracaoFuncionamento" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "fechamentoManual" BOOLEAN NOT NULL DEFAULT false,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ConfiguracaoFuncionamento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HorarioFuncionamento" (
    "id" SERIAL NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "fechado" BOOLEAN NOT NULL DEFAULT false,
    "abertura" VARCHAR(5) NOT NULL,
    "fechamento" VARCHAR(5) NOT NULL,
    CONSTRAINT "HorarioFuncionamento_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HorarioFuncionamento_diaSemana_key"
ON "HorarioFuncionamento"("diaSemana");

INSERT INTO "ConfiguracaoFuncionamento" ("id", "fechamentoManual", "atualizadoEm")
VALUES (1, false, CURRENT_TIMESTAMP);

INSERT INTO "HorarioFuncionamento" ("diaSemana", "fechado", "abertura", "fechamento")
VALUES
  (0, false, '00:00', '00:00'),
  (1, false, '00:00', '00:00'),
  (2, false, '00:00', '00:00'),
  (3, false, '00:00', '00:00'),
  (4, false, '00:00', '00:00'),
  (5, false, '00:00', '00:00'),
  (6, false, '00:00', '00:00');
