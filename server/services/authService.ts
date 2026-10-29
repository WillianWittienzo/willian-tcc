import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { TipoTokenConta } from "@/app/generated/prisma/client";
import {
  DadosEntregaInvalidosError,
  normalizarEnderecoEntrega,
  normalizarTelefone,
} from "@/lib/checkout";
import { cpfValido, somenteDigitosCpf } from "@/lib/cpf";
import { erroSenhaForte } from "@/lib/senha";
import { authRepository } from "@/server/repositories/authRepository";
import { emailService, urlSeguraDaAplicacao } from "@/server/services/emailService";

const scryptAsync = promisify(scrypt);
const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000;
const DURACAO_VERIFICACAO_EMAIL_MS = 24 * 60 * 60 * 1000;
const DURACAO_RECUPERACAO_SENHA_MS = 30 * 60 * 1000;

export class AuthCredenciaisInvalidasError extends Error {}
export class AuthDadosInvalidosError extends Error {}
export class AuthEmailDuplicadoError extends Error {}
export class AuthCpfDuplicadoError extends Error {}
export class AuthTokenInvalidoError extends Error {}

function campoDuplicadoNoBanco(error: unknown, campo: string) {
  if (!(
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )) return false;
  const alvo = "meta" in error && error.meta ? JSON.stringify(error.meta) : "";
  return alvo.includes(campo);
}

function usuarioPublico(usuario: {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  emailVerificadoEm: Date | null;
  papel: "Cliente" | "Admin";
}) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    emailVerificado: usuario.emailVerificadoEm !== null,
    papel: usuario.papel,
  };
}

function perfilPublico(usuario: Awaited<ReturnType<typeof authRepository.buscarPorId>>) {
  if (!usuario) return null;
  return {
    ...usuarioPublico(usuario),
    cpf: usuario.cpf,
    cep: usuario.cep,
    rua: usuario.rua,
    numero: usuario.numero,
    bairro: usuario.bairro,
    complemento: usuario.complemento,
    referencia: usuario.referencia,
  };
}

export function hashTokenSessao(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function escaparHtml(valor: string) {
  return valor.replace(/[&<>'"]/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[caractere]!);
}

async function criarTokenConta(usuarioId: number, tipo: TipoTokenConta, duracaoMs: number) {
  const token = randomBytes(32).toString("base64url");
  await authRepository.criarTokenConta({
    usuarioId,
    tipo,
    tokenHash: hashTokenSessao(token),
    expiraEm: new Date(Date.now() + duracaoMs),
  });
  return token;
}

async function enviarVerificacaoEmail(usuario: { id: number; nome: string; email: string }) {
  if (!emailService.configurado()) return false;
  const token = await criarTokenConta(usuario.id, TipoTokenConta.VerificacaoEmail, DURACAO_VERIFICACAO_EMAIL_MS);
  const link = urlSeguraDaAplicacao("/confirmar-email", token);
  if (!link) return false;
  const nome = escaparHtml(usuario.nome);
  const resultado = await emailService.enviar({
    para: usuario.email,
    assunto: "Confirme seu e-mail — Brasa Quente",
    texto: `Olá, ${usuario.nome}. Confirme seu e-mail acessando este link, válido por 24 horas: ${link}`,
    html: `<p>Olá, ${nome}.</p><p>Confirme seu e-mail no Brasa Quente:</p><p><a href="${link}">Confirmar e-mail</a></p><p>O link é válido por 24 horas e pode ser usado uma única vez.</p>`,
  });
  return resultado.enviado;
}

async function enviarRecuperacaoSenha(usuario: { id: number; nome: string; email: string }) {
  if (!emailService.configurado()) return false;
  const token = await criarTokenConta(usuario.id, TipoTokenConta.RecuperacaoSenha, DURACAO_RECUPERACAO_SENHA_MS);
  const link = urlSeguraDaAplicacao("/redefinir-senha", token);
  if (!link) return false;
  const nome = escaparHtml(usuario.nome);
  const resultado = await emailService.enviar({
    para: usuario.email,
    assunto: "Recuperação de senha — Brasa Quente",
    texto: `Olá, ${usuario.nome}. Redefina sua senha acessando este link, válido por 30 minutos: ${link}`,
    html: `<p>Olá, ${nome}.</p><p>Use o link abaixo para redefinir sua senha:</p><p><a href="${link}">Redefinir senha</a></p><p>O link expira em 30 minutos e pode ser usado uma única vez.</p>`,
  });
  return resultado.enviado;
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
  const cpf = somenteDigitosCpf(campos.cpf);
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
  const erroSenha = erroSenhaForte(senha);
  if (erroSenha) throw new AuthDadosInvalidosError(erroSenha);

  if (!cpfValido(cpf)) {
    throw new AuthDadosInvalidosError("Informe um CPF válido");
  }

  return { nome, email, telefone, cpf, senha };
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

export function validarDadosPessoais(data: unknown) {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new AuthDadosInvalidosError("Dados pessoais inválidos");
  }
  const campos = data as Record<string, unknown>;
  const nome = typeof campos.nome === "string" ? campos.nome.trim().replace(/\s+/g, " ") : "";
  const cpfRecebido = somenteDigitosCpf(campos.cpf);
  let telefone: string;
  try {
    telefone = normalizarTelefone(campos.telefone);
  } catch {
    throw new AuthDadosInvalidosError("Informe um telefone válido com DDD");
  }
  if (nome.length < 2 || nome.length > 100) {
    throw new AuthDadosInvalidosError("Nome deve ter entre 2 e 100 caracteres");
  }
  if (cpfRecebido && !cpfValido(cpfRecebido)) {
    throw new AuthDadosInvalidosError("Informe um CPF válido");
  }
  return { nome, telefone, cpf: cpfRecebido || null };
}

export function validarAlteracaoSenha(data: unknown) {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new AuthDadosInvalidosError("Dados de senha inválidos");
  }
  const campos = data as Record<string, unknown>;
  const senhaAtual = typeof campos.senhaAtual === "string" ? campos.senhaAtual : "";
  const novaSenha = typeof campos.novaSenha === "string" ? campos.novaSenha : "";
  const confirmarNovaSenha = typeof campos.confirmarNovaSenha === "string" ? campos.confirmarNovaSenha : "";
  if (!senhaAtual || senhaAtual.length > 128) {
    throw new AuthDadosInvalidosError("Informe a senha atual");
  }
  const erroSenha = erroSenhaForte(novaSenha);
  if (erroSenha) throw new AuthDadosInvalidosError(erroSenha);
  if (novaSenha !== confirmarNovaSenha) {
    throw new AuthDadosInvalidosError("As novas senhas não coincidem");
  }
  return { senhaAtual, novaSenha };
}

export const authService = {
  async perfil(usuarioId: number) {
    return perfilPublico(await authRepository.buscarPorId(usuarioId));
  },

  async atualizarDadosPessoais(usuarioId: number, data: unknown) {
    const dados = validarDadosPessoais(data);
    const usuario = await authRepository.buscarPorId(usuarioId);
    if (!usuario) throw new AuthDadosInvalidosError("Cliente não encontrado");
    const cpf = dados.cpf ?? usuario.cpf;
    if (cpf) {
      const existente = await authRepository.buscarPorCpf(cpf);
      if (existente && existente.id !== usuarioId) {
        throw new AuthCpfDuplicadoError("CPF já cadastrado em outra conta");
      }
    }
    try {
      return perfilPublico(await authRepository.atualizarDadosPessoais(usuarioId, {
        ...dados,
        cpf,
      }));
    } catch (error) {
      if (campoDuplicadoNoBanco(error, "cpf")) {
        throw new AuthCpfDuplicadoError("CPF já cadastrado em outra conta");
      }
      throw error;
    }
  },

  async atualizarEndereco(usuarioId: number, data: unknown) {
    try {
      const endereco = normalizarEnderecoEntrega(data);
      return perfilPublico(await authRepository.atualizarEndereco(usuarioId, endereco));
    } catch (error) {
      if (error instanceof DadosEntregaInvalidosError) {
        throw new AuthDadosInvalidosError(error.message);
      }
      throw error;
    }
  },

  async alterarSenha(usuarioId: number, tokenAtual: string, data: unknown) {
    const senhas = validarAlteracaoSenha(data);
    const usuario = await authRepository.buscarPorId(usuarioId);
    if (!usuario || !(await verificarSenha(senhas.senhaAtual, usuario.senhaHash))) {
      throw new AuthCredenciaisInvalidasError("Senha atual incorreta");
    }
    await authRepository.atualizarSenhaEInvalidarOutrasSessoes(
      usuarioId,
      await gerarHashSenha(senhas.novaSenha),
      hashTokenSessao(tokenAtual),
    );
  },

  async cadastrar(data: unknown) {
    const dados = validarCadastro(data);
    if (await authRepository.buscarPorEmail(dados.email)) {
      throw new AuthEmailDuplicadoError("E-mail já cadastrado");
    }
    if (await authRepository.buscarPorCpf(dados.cpf)) {
      throw new AuthCpfDuplicadoError("CPF já cadastrado em outra conta");
    }

    try {
      const usuario = await authRepository.criarCliente({
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        cpf: dados.cpf,
        senhaHash: await gerarHashSenha(dados.senha),
      });
      let emailEnviado = false;
      try {
        emailEnviado = await enviarVerificacaoEmail(usuario);
      } catch (error) {
        console.error("Não foi possível preparar a verificação de e-mail:", error instanceof Error ? error.message : "erro desconhecido");
      }
      return {
        usuario: usuarioPublico(usuario),
        emailEnviado,
      };
    } catch (error) {
      if (campoDuplicadoNoBanco(error, "email")) {
        throw new AuthEmailDuplicadoError("E-mail já cadastrado");
      }
      if (campoDuplicadoNoBanco(error, "cpf")) {
        throw new AuthCpfDuplicadoError("CPF já cadastrado em outra conta");
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

  async reenviarVerificacaoEmail(usuarioId: number) {
    const usuario = await authRepository.buscarPorId(usuarioId);
    if (!usuario || usuario.papel !== "Cliente" || usuario.emailVerificadoEm) return false;
    return enviarVerificacaoEmail(usuario);
  },

  async confirmarEmail(data: unknown) {
    const token = typeof data === "object" && data !== null && "token" in data && typeof data.token === "string"
      ? data.token
      : "";
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new AuthTokenInvalidoError("Link de confirmação inválido ou expirado");
    const registro = await authRepository.buscarTokenConta(
      hashTokenSessao(token),
      TipoTokenConta.VerificacaoEmail,
    );
    const agora = new Date();
    if (!registro || registro.usadoEm || registro.expiraEm <= agora) {
      throw new AuthTokenInvalidoError("Link de confirmação inválido ou expirado");
    }
    if (!(await authRepository.confirmarEmailComToken(registro.id, registro.usuarioId, agora))) {
      throw new AuthTokenInvalidoError("Link de confirmação inválido ou expirado");
    }
  },

  async solicitarRecuperacaoSenha(data: unknown) {
    const email = typeof data === "object" && data !== null && "email" in data && typeof data.email === "string"
      ? data.email.trim().toLowerCase()
      : "";
    if (email && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const usuario = await authRepository.buscarPorEmail(email);
      if (usuario?.papel === "Cliente") await enviarRecuperacaoSenha(usuario);
    }
    return { emailConfigurado: emailService.configurado() };
  },

  async redefinirSenha(data: unknown) {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new AuthDadosInvalidosError("Dados de recuperação inválidos");
    }
    const campos = data as Record<string, unknown>;
    const token = typeof campos.token === "string" ? campos.token : "";
    const novaSenha = typeof campos.novaSenha === "string" ? campos.novaSenha : "";
    const confirmarNovaSenha = typeof campos.confirmarNovaSenha === "string" ? campos.confirmarNovaSenha : "";
    const erroSenha = erroSenhaForte(novaSenha);
    if (erroSenha) throw new AuthDadosInvalidosError(erroSenha);
    if (novaSenha !== confirmarNovaSenha) throw new AuthDadosInvalidosError("As novas senhas não coincidem");
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new AuthTokenInvalidoError("Link de recuperação inválido ou expirado");
    const registro = await authRepository.buscarTokenConta(
      hashTokenSessao(token),
      TipoTokenConta.RecuperacaoSenha,
    );
    const agora = new Date();
    if (!registro || registro.usadoEm || registro.expiraEm <= agora) {
      throw new AuthTokenInvalidoError("Link de recuperação inválido ou expirado");
    }
    const redefinida = await authRepository.redefinirSenhaComToken(
      registro.id,
      registro.usuarioId,
      await gerarHashSenha(novaSenha),
      agora,
    );
    if (!redefinida) throw new AuthTokenInvalidoError("Link de recuperação inválido ou expirado");
  },
};
