import "dotenv/config";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

const bancoLocal = resolve(process.cwd(), "prisma/local/brasa-quente.db").replaceAll("\\", "/");

export default defineConfig({
  schema: "prisma/sqlite/schema.prisma",
  datasource: {
    url: process.env["SQLITE_DATABASE_URL"] ?? `file:${bancoLocal}`,
  },
});
