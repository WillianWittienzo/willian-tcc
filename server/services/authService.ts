import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { authRepository } from "@/server/repositories/authRepository";

const scryptAsync = promisify(scrypt);
const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthDadosInvalidosError extends Error {}
export class AuthCredenciaisInvalidasError extends Error {}
export class AuthEmailDuplicadoError extends Error {}

function emailDuplicadoNoBanco(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function usuarioPublico(usuario: {
  id: number;
  nome: string;
  email: string;
  papel: "Cliente" | "Admin";
}) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
  };
}

export function hashTokenSessao(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function gerarHashSenha(senha: string) {
  const salt = randomBytes(16).toString("hex");
  const chave = (await scryptAsync(senha, salt, 64)) as Buffer;
  return `scrypt$${salt}$${chave.toString("hex")}`;
}

async function verificarSenha(senha: string, hashArmazenado: string) {
  const [algoritmo, salt, hash] = hashArmazenado.split("$");
  if (algoritmo !== "scrypt" || !salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, "hex");
  const chave = (await scryptAsync(senha, salt, hashBuffer.length)) as Buffer;
  return hashBuffer.length === chave.length && timingSafeEqual(hashBuffer, chave);
}

function validarCadastro(data: unknown) {
  if (typeof data !== "object" || data === null) {
    throw new AuthDadosInvalidosError("Dados de cadastro inválidos");
  }

  const nome = "nome" in data && typeof data.nome === "string" ? data.nome.trim() : "";
  const email = "email" in data && typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const senha = "senha" in data && typeof data.senha === "string" ? data.senha : "";

  if (nome.length < 2 || nome.length > 100 || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email) || senha.length < 8 || senha.length > 128) {
    throw new AuthDadosInvalidosError(
      "Informe nome, email válido e senha entre 8 e 128 caracteres"
    );
  }

  return { nome, email, senha };
}

function validarLogin(data: unknown) {
  if (typeof data !== "object" || data === null) {
    throw new AuthCredenciaisInvalidasError("Email ou senha inválidos");
  }

  const email = "email" in data && typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const senha = "senha" in data && typeof data.senha === "string" ? data.senha : "";
  if (!email || email.length > 254 || !senha || senha.length > 128) {
    throw new AuthCredenciaisInvalidasError("Email ou senha inválidos");
  }
  return { email, senha };
}

export const authService = {
  async cadastrar(data: unknown) {
    const dados = validarCadastro(data);
    if (await authRepository.buscarPorEmail(dados.email)) {
      throw new AuthEmailDuplicadoError("Email já cadastrado");
    }

    try {
      const usuario = await authRepository.criarUsuario({
        nome: dados.nome,
        email: dados.email,
        senhaHash: await gerarHashSenha(dados.senha),
      });
      return usuarioPublico(usuario);
    } catch (error) {
      if (emailDuplicadoNoBanco(error)) {
        throw new AuthEmailDuplicadoError("Email já cadastrado");
      }
      throw error;
    }
  },

  async login(data: unknown) {
    const dados = validarLogin(data);
    const usuario = await authRepository.buscarPorEmail(dados.email);
    if (!usuario || !(await verificarSenha(dados.senha, usuario.senhaHash))) {
      throw new AuthCredenciaisInvalidasError("Email ou senha inválidos");
    }

    await authRepository.excluirSessoesExpiradasDoUsuario(usuario.id, new Date());
    const token = randomBytes(32).toString("base64url");
    const expiraEm = new Date(Date.now() + DURACAO_SESSAO_MS);
    await authRepository.criarSessao({
      tokenHash: hashTokenSessao(token),
      usuarioId: usuario.id,
      expiraEm,
    });

    return { usuario: usuarioPublico(usuario), token, expiraEm };
  },

  async usuarioPorToken(token?: string) {
    if (!token) return null;
    const tokenHash = hashTokenSessao(token);
    const sessao = await authRepository.buscarSessao(tokenHash);
    if (!sessao) return null;
    if (sessao.expiraEm <= new Date()) {
      await authRepository.excluirSessao(tokenHash);
      return null;
    }
    return usuarioPublico(sessao.usuario);
  },

  async logout(token?: string) {
    if (token) await authRepository.excluirSessao(hashTokenSessao(token));
  },
};
