export type Usuario = {
  id: number;
  nome: string;
  email: string;
  papel: "Cliente" | "Admin";
};

async function resposta<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.erro ?? "Erro de autenticação");
  return data;
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

export async function logout() {
  await resposta<{ mensagem: string }>(await fetch("/api/auth/logout", { method: "POST" }));
}
