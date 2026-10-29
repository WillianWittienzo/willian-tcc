import { prisma } from "@/lib/prisma";
import { PapelUsuario, TipoTokenConta } from "@/app/generated/prisma/client";

export const authRepository = {
  buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  buscarPorCpf(cpf: string) {
    return prisma.usuario.findUnique({ where: { cpf } });
  },

  buscarPorId(id: number) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  atualizarDadosPessoais(id: number, data: { nome: string; telefone: string; cpf: string | null }) {
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

  criarCliente(data: { nome: string; email: string; telefone: string; cpf: string; senhaHash: string }) {
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

  async criarTokenConta(data: {
    usuarioId: number;
    tipo: TipoTokenConta;
    tokenHash: string;
    expiraEm: Date;
  }) {
    return prisma.$transaction(async (transacao) => {
      await transacao.tokenConta.deleteMany({
        where: { usuarioId: data.usuarioId, tipo: data.tipo, usadoEm: null },
      });
      return transacao.tokenConta.create({ data });
    });
  },

  buscarTokenConta(tokenHash: string, tipo: TipoTokenConta) {
    return prisma.tokenConta.findFirst({
      where: { tokenHash, tipo },
      include: { usuario: true },
    });
  },

  confirmarEmailComToken(tokenId: number, usuarioId: number, agora: Date) {
    return prisma.$transaction(async (transacao) => {
      const consumido = await transacao.tokenConta.updateMany({
        where: { id: tokenId, usuarioId, usadoEm: null, expiraEm: { gt: agora } },
        data: { usadoEm: agora },
      });
      if (consumido.count !== 1) return false;
      await transacao.usuario.update({
        where: { id: usuarioId },
        data: { emailVerificadoEm: agora },
      });
      return true;
    });
  },

  redefinirSenhaComToken(tokenId: number, usuarioId: number, senhaHash: string, agora: Date) {
    return prisma.$transaction(async (transacao) => {
      const consumido = await transacao.tokenConta.updateMany({
        where: { id: tokenId, usuarioId, usadoEm: null, expiraEm: { gt: agora } },
        data: { usadoEm: agora },
      });
      if (consumido.count !== 1) return false;
      await transacao.usuario.update({ where: { id: usuarioId }, data: { senhaHash } });
      await transacao.sessao.deleteMany({ where: { usuarioId } });
      return true;
    });
  },
};
