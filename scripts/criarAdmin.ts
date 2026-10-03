import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, PapelUsuario } from "../app/generated/prisma/client";
import { gerarHashSenha } from "../server/services/authService";

const nome = process.env.ADMIN_NOME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const senha = process.env.ADMIN_SENHA;

if (!nome || !email || !senha || senha.length < 8) {
  throw new Error("Defina ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA (mínimo 8 caracteres)");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const senhaHash = await gerarHashSenha(senha!);
  await prisma.usuario.upsert({
    where: { email: email! },
    update: { nome: nome!, senhaHash, papel: PapelUsuario.Admin },
    create: { nome: nome!, email: email!, senhaHash, papel: PapelUsuario.Admin },
  });
  console.log(`Administrador configurado: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
