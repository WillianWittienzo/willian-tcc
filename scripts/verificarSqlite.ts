import "dotenv/config";
import { prisma } from "../lib/prisma";

if (process.env.DATABASE_PROVIDER !== "sqlite") {
  throw new Error("Este diagnóstico deve ser executado somente pelo script sqlite:check");
}

async function main() {
  const [produtos, usuarios, clientes, administradores, pedidos, sessoes] = await Promise.all([
    prisma.produto.count(),
    prisma.usuario.count(),
    prisma.usuario.findMany({
      where: { papel: "Cliente" },
      select: { email: true },
      orderBy: { id: "asc" },
    }),
    prisma.usuario.count({ where: { papel: "Admin" } }),
    prisma.pedido.count(),
    prisma.sessao.count(),
  ]);

  console.log(`Provedor selecionado: ${process.env.DATABASE_PROVIDER}`);
  console.log(`Arquivo selecionado: ${process.env.SQLITE_DATABASE_URL}`);
  console.log({
    produtos,
    usuarios,
    clientes: clientes.length,
    emailsClientes: clientes.map((cliente) => cliente.email),
    administradores,
    pedidos,
    sessoes,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
