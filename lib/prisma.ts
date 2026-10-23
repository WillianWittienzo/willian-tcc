import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient as PrismaPostgresClient } from "@/app/generated/prisma/client";
import { PrismaClient as PrismaSqliteClient } from "@/app/generated/prisma-sqlite/client";

type ProvedorBanco = "postgresql" | "sqlite";
type PrismaDaAplicacao = PrismaPostgresClient;

function obterProvedor(): ProvedorBanco {
  const provedor = process.env.DATABASE_PROVIDER ?? "postgresql";
  if (provedor !== "postgresql" && provedor !== "sqlite") {
    throw new Error("DATABASE_PROVIDER deve ser 'postgresql' ou 'sqlite'");
  }
  return provedor;
}

function criarCliente(provedor: ProvedorBanco): PrismaDaAplicacao {
  if (provedor === "sqlite") {
    const url = process.env.SQLITE_DATABASE_URL;
    if (!url?.startsWith("file:")) {
      throw new Error("Defina SQLITE_DATABASE_URL com uma URL file: para usar SQLite");
    }
    const adapter = new PrismaBetterSqlite3({ url });
    return new PrismaSqliteClient({ adapter }) as unknown as PrismaDaAplicacao;
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaPostgresClient({ adapter });
}

const provedor = obterProvedor();

const globalForPrisma = globalThis as unknown as {
  prismaBrasaQuente: { provedor: ProvedorBanco; cliente: PrismaDaAplicacao } | undefined;
};

const cache = globalForPrisma.prismaBrasaQuente;
export const prisma = cache?.provedor === provedor ? cache.cliente : criarCliente(provedor);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaBrasaQuente = { provedor, cliente: prisma };
}
