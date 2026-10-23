import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { normalizarTelefone } from "@/lib/checkout";
import { authRepository } from "@/server/repositories/authRepository";

const scryptAsync = promisify(scrypt);
const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthCredenciaisInvalidasError extends Error {}
export class AuthDadosInvalidosError extends Error {}
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
  telefone: string | null;
  papel: "Cliente" | "Admin";
}) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
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

export async function verificarSenha(senha: string, hashArmazenado: string) {
  const [algoritmo, salt, hash] = hashArmazenado.split("$");
  if (
    algoritmo !== "scrypt" ||
    !/^[a-f\d]{32}$/i.test(salt ?? "") ||
    !/^[a-f\d]{128}$/i.test(hash ?? "")
  ) return false;

  const hashBuffer = Buffer.from(hash, "hex");
  const chave = (await scryptAsync(senha, salt, hashBuffer.length)) as Buffer;
  return hashBuffer.length === chave.length && timingSafeEqual(hashBuffer, chave);
}

export function validarCadastro(data: unknown) {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new AuthDadosInvalidosError("Dados de cadastro inválidos");
  }

  const campos = data as Record<string, unknown>;
  const nome = typeof campos.nome === "string"
    ? campos.nome.trim().replace(/\s+/g, " ")
    : "";
  const email = typeof campos.email === "string" ? campos.email.trim().toLowerCase() : "";
  const senha = typeof campos.senha === "string" ? campos.senha : "";
  let telefone: string;

  try {
    telefone = normalizarTelefone(campos.telefone);
  } catch {
    throw new AuthDadosInvalidosError("Informe um telefone válido com DDD");
  }

  if (nome.length < 2 || nome.length > 100) {
    throw new AuthDadosInvalidosError("Nome deve ter entre 2 e 100 caracteres");
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthDadosInvalidosError("Informe um e-mail válido");
  }
  if (senha.length < 8 || senha.length > 128) {
    throw new AuthDadosInvalidosError("Senha deve ter entre 8 e 128 caracteres");
  }

  return { nome, email, telefone, senha };
}

export function validarLogin(data: unknown) {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
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
      throw new AuthEmailDuplicadoError("E-mail já cadastrado");
    }

    try {
      const usuario = await authRepository.criarCliente({
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        senhaHash: await gerarHashSenha(dados.senha),
      });
      return usuarioPublico(usuario);
    } catch (error) {
      if (emailDuplicadoNoBanco(error)) {
        throw new AuthEmailDuplicadoError("E-mail já cadastrado");
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
