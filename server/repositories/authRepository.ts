import { prisma } from "@/lib/prisma";
import { PapelUsuario } from "@/app/generated/prisma/client";

export const authRepository = {
  buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  buscarPorId(id: number) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  atualizarDadosPessoais(id: number, data: { nome: string; telefone: string }) {
    return prisma.usuario.update({ where: { id }, data });
  },

  atualizarEndereco(id: number, data: {
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    complemento: string | null;
    referencia: string | null;
  }) {
    return prisma.usuario.update({ where: { id }, data });
  },

  atualizarSenhaEInvalidarOutrasSessoes(
    usuarioId: number,
    senhaHash: string,
    tokenHashAtual: string,
  ) {
    return prisma.$transaction([
      prisma.usuario.update({ where: { id: usuarioId }, data: { senhaHash } }),
      prisma.sessao.deleteMany({
        where: { usuarioId, tokenHash: { not: tokenHashAtual } },
      }),
    ]);
  },

  criarCliente(data: { nome: string; email: string; telefone: string; senhaHash: string }) {
    return prisma.usuario.create({
      data: { ...data, papel: PapelUsuario.Cliente },
    });
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
