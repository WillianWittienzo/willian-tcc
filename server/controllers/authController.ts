import {
  AuthCredenciaisInvalidasError,
  AuthDadosInvalidosError,
  AuthEmailDuplicadoError,
  authService,
} from "@/server/services/authService";

function erroAuth(error: unknown) {
  if (error instanceof AuthCredenciaisInvalidasError || error instanceof AuthDadosInvalidosError) {
    return { status: 400, data: { erro: error.message } };
  }
  if (error instanceof AuthEmailDuplicadoError) {
    return { status: 409, data: { erro: error.message } };
  }
  console.error("Erro de autenticação:", error);
  return { status: 500, data: { erro: "Erro interno de autenticação" } };
}

export const authController = {
  async perfil(usuarioId: number) {
    try {
      const perfil = await authService.perfil(usuarioId);
      return perfil
        ? { status: 200, data: { perfil } }
        : { status: 404, data: { erro: "Cliente não encontrado" } };
    } catch (error) {
      return erroAuth(error);
    }
  },

  async atualizarDadosPessoais(usuarioId: number, data: unknown) {
    try {
      return {
        status: 200,
        data: { perfil: await authService.atualizarDadosPessoais(usuarioId, data) },
      };
    } catch (error) {
      return erroAuth(error);
    }
  },

  async atualizarEndereco(usuarioId: number, data: unknown) {
    try {
      return {
        status: 200,
        data: { perfil: await authService.atualizarEndereco(usuarioId, data) },
      };
    } catch (error) {
      return erroAuth(error);
    }
  },

  async alterarSenha(usuarioId: number, tokenAtual: string, data: unknown) {
    try {
      await authService.alterarSenha(usuarioId, tokenAtual, data);
      return { status: 200, data: { mensagem: "Senha alterada com sucesso" } };
    } catch (error) {
      return erroAuth(error);
    }
  },

  async cadastrar(data: unknown) {
    try {
      return { status: 201, data: { usuario: await authService.cadastrar(data) } };
    } catch (error) {
      return erroAuth(error);
    }
  },

  async login(data: unknown) {
    try {
      const sessao = await authService.login(data);
      return { status: 200, data: { usuario: sessao.usuario }, sessao };
    } catch (error) {
      return erroAuth(error);
    }
  },
};
