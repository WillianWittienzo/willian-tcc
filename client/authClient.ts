export type Usuario = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  emailVerificado: boolean;
  papel: "Cliente" | "Admin";
};

export type PerfilCliente = Usuario & {
  cpf: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  referencia: string | null;
};

async function resposta<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.erro ?? "Erro de autenticação");
  return data;
}

export async function cadastrar(data: { nome: string; email: string; telefone: string; cpf: string; senha: string }) {
  return resposta<{ usuario: Usuario; emailEnviado: boolean }>(await fetch("/api/auth/cadastro", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  }));
}

export async function login(email: string, senha: string) {
  const data = await resposta<{ usuario: Usuario }>(await fetch("/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, senha }),
  }));
  return data.usuario;
}

export async function buscarSessao() {
  const response = await fetch("/api/auth/me");
  if (response.status === 401) return null;
  return (await resposta<{ usuario: Usuario }>(response)).usuario;
}

export async function buscarPerfil() {
  const response = await fetch("/api/perfil");
  return (await resposta<{ perfil: PerfilCliente }>(response)).perfil;
}

export async function atualizarDadosPessoais(data: { nome: string; telefone: string; cpf: string }) {
  const response = await fetch("/api/perfil", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return (await resposta<{ perfil: PerfilCliente }>(response)).perfil;
}

export async function atualizarEndereco(data: {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  referencia: string;
}) {
  const response = await fetch("/api/perfil/endereco", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return (await resposta<{ perfil: PerfilCliente }>(response)).perfil;
}

export async function alterarSenha(data: {
  senhaAtual: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}) {
  const response = await fetch("/api/perfil/senha", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return resposta<{ mensagem: string }>(response);
}

export async function reenviarVerificacaoEmail() {
  return resposta<{ mensagem: string; emailEnviado: boolean }>(await fetch("/api/auth/email/reenviar", {
    method: "POST",
  }));
}

export async function confirmarEmail(token: string) {
  return resposta<{ mensagem: string }>(await fetch("/api/auth/email/confirmar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }));
}

export async function solicitarRecuperacaoSenha(email: string) {
  return resposta<{ mensagem: string; emailConfigurado: boolean }>(await fetch("/api/auth/senha/solicitar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }));
}

export async function redefinirSenha(token: string, novaSenha: string, confirmarNovaSenha: string) {
  return resposta<{ mensagem: string }>(await fetch("/api/auth/senha/redefinir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, novaSenha, confirmarNovaSenha }),
  }));
}

export async function logout() {
  await resposta<{ mensagem: string }>(await fetch("/api/auth/logout", { method: "POST" }));
}
