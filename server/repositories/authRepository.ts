import { prisma } from "@/lib/prisma";
import { PapelUsuario } from "@/app/generated/prisma/client";

export const authRepository = {
  buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  criarUsuario(data: { nome: string; email: string; senhaHash: string }) {
    return prisma.usuario.create({
      data: { ...data, papel: PapelUsuario.Cliente },
    });
  },

  criarSessao(data: { tokenHash: string; usuarioId: number; expiraEm: Date }) {
    return prisma.sessao.create({ data });
  },

  buscarSessao(tokenHash: string) {
    return prisma.sessao.findUnique({
      where: { tokenHash },
      include: { usuario: true },
    });
  },

  excluirSessao(tokenHash: string) {
    return prisma.sessao.deleteMany({ where: { tokenHash } });
  },
};
