
export type User = {
  id: number
  nome: string
  email: string
  endereco?: string
}

export async function register(data: {
  nome: string
  email: string
  senha: string
}) {
  const newUser: User = {
    id: Date.now(),
    nome: data.nome,
    email: data.email,
  }

  localStorage.setItem("user", JSON.stringify(newUser))

  return newUser
}

export async function login(email: string, senha: string) {
  const user = localStorage.getItem("user")

  if (!user) throw new Error("Usuário não encontrado")

  return JSON.parse(user)
}

export function logout() {
  localStorage.removeItem("user")
}