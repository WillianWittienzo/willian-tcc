-- AlterTable: nullable para preservar administradores e usuários já existentes.
ALTER TABLE "Usuario" ADD COLUMN "telefone" VARCHAR(11);
