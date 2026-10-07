import { prisma } from "@/lib/prisma";

export const authRepository = {
  buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  criarSessao(data: { tokenHash: string; usuarioId: number; expiraEm: Date }) {
    return prisma.sessao.create({ data });
  },

  excluirSessoesExpiradasDoUsuario(usuarioId: number, agora: Date) {
    return prisma.sessao.deleteMany({
      where: { usuarioId, expiraEm: { lte: agora } },
    });
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
