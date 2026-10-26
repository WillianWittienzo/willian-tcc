import "dotenv/config";
import { PapelUsuario } from "../app/generated/prisma/client";
import { prisma } from "../lib/prisma";
import { gerarHashSenha } from "../server/services/authService";

if (process.env.DATABASE_PROVIDER !== "sqlite" || process.env.NODE_ENV === "production") {
  throw new Error("A conta de teste só pode ser configurada no SQLite local");
}

const nome = process.env.CLIENTE_TESTE_NOME?.trim();
const email = process.env.CLIENTE_TESTE_EMAIL?.trim().toLowerCase();
const senha = process.env.CLIENTE_TESTE_SENHA;

if (!nome || !email || !senha || senha.length < 8) {
  throw new Error(
    "Defina CLIENTE_TESTE_NOME, CLIENTE_TESTE_EMAIL e CLIENTE_TESTE_SENHA (mínimo 8 caracteres)",
  );
}

async function main() {
  const existente = await prisma.usuario.findUnique({ where: { email: email! } });
  if (existente?.papel === PapelUsuario.Admin) {
    throw new Error("O e-mail informado pertence a um administrador e não será alterado");
  }

  const senhaHash = await gerarHashSenha(senha!);
  await prisma.usuario.upsert({
    where: { email: email! },
    update: { nome: nome!, senhaHash },
    create: { nome: nome!, email: email!, senhaHash, papel: PapelUsuario.Cliente },
  });
  console.log(`Cliente local configurado: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
