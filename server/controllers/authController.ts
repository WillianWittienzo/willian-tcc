import {
  AuthCredenciaisInvalidasError,
  AuthDadosInvalidosError,
  AuthEmailDuplicadoError,
  authService,
} from "@/server/services/authService";

function erroAuth(error: unknown) {
  if (error instanceof AuthDadosInvalidosError || error instanceof AuthCredenciaisInvalidasError) {
    return { status: 400, data: { erro: error.message } };
  }
  if (error instanceof AuthEmailDuplicadoError) {
    return { status: 409, data: { erro: error.message } };
  }
  console.error("Erro de autenticação:", error);
  return { status: 500, data: { erro: "Erro interno de autenticação" } };
}

export const authController = {
  async cadastrar(data: unknown) {
    try {
      return { status: 201, data: await authService.cadastrar(data) };
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
