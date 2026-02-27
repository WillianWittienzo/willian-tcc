"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

type User = {
  id: number
  nome: string
  email: string
  endereco?: string
}

type AuthContextType = {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // 🔥 AQUI FICA O useEffect
  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  function login(userData: User) {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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