"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import * as authClient from "@/client/authClient"
import type { Usuario } from "@/client/authClient"

type AuthContextType = {
  user: Usuario | null
  carregando: boolean
  login: (email: string, senha: string) => Promise<Usuario>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    authClient.buscarSessao()
      .then(setUser)
      .finally(() => setCarregando(false))
  }, [])

  async function login(email: string, senha: string) {
    const usuario = await authClient.login(email, senha)
    setUser(usuario)
    return usuario
  }

  async function logout() {
    await authClient.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth deve estar dentro do AuthProvider")
  }

  return context
}
