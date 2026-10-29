import {
  AuthCredenciaisInvalidasError,
  AuthDadosInvalidosError,
  AuthCpfDuplicadoError,
  AuthEmailDuplicadoError,
  AuthTokenInvalidoError,
  authService,
} from "@/server/services/authService";

function erroAuth(error: unknown) {
  if (error instanceof AuthCredenciaisInvalidasError || error instanceof AuthDadosInvalidosError) {
    return { status: 400, data: { erro: error.message } };
  }
  if (error instanceof AuthEmailDuplicadoError || error instanceof AuthCpfDuplicadoError) {
    return { status: 409, data: { erro: error.message } };
  }
  if (error instanceof AuthTokenInvalidoError) {
    return { status: 400, data: { erro: error.message } };
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
      const cadastro = await authService.cadastrar(data);
      return { status: 201, data: cadastro };
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

  async reenviarVerificacaoEmail(usuarioId: number) {
    try {
      return {
        status: 200,
        data: {
          mensagem: "Se a conta ainda precisar de verificação, o envio será realizado.",
          emailEnviado: await authService.reenviarVerificacaoEmail(usuarioId),
        },
      };
    } catch (error) {
      return erroAuth(error);
    }
  },

  async confirmarEmail(data: unknown) {
    try {
      await authService.confirmarEmail(data);
      return { status: 200, data: { mensagem: "E-mail confirmado com sucesso." } };
    } catch (error) {
      return erroAuth(error);
    }
  },

  async solicitarRecuperacaoSenha(data: unknown) {
    try {
      const resultado = await authService.solicitarRecuperacaoSenha(data);
      return {
        status: 200,
        data: {
          mensagem: "Se houver uma conta de cliente com esse e-mail, as instruções serão enviadas.",
          ...resultado,
        },
      };
    } catch (error) {
      return erroAuth(error);
    }
  },

  async redefinirSenha(data: unknown) {
    try {
      await authService.redefinirSenha(data);
      return { status: 200, data: { mensagem: "Senha redefinida com sucesso. Entre novamente." } };
    } catch (error) {
      return erroAuth(error);
    }
  },
};
