"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation"

export default function LoginPage() {

    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")

    const { login } = useAuth()
    const router = useRouter()

    const [erro, setErro] = useState("")
    const [enviando, setEnviando] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro("")
        setEnviando(true)

        try {
            const usuario = await login(email, senha)
            router.push(usuario.papel === "Admin" ? "/admin" : "/cardapio")
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Erro ao entrar")
        } finally {
            setEnviando(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

                <div className="flex justify-center mb-6">
                    <div className="bg-red-800 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl">
                        <Image
                            src="/logo.png/fogo3.png"
                            alt="Brasa Quente"
                            width={40}
                            height={40}
                        />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center mb-2">
                    BEM-VINDO
                </h1>

                <p className="text-center text-gray-500 mb-6">
                    Entre na sua conta
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {erro && <p className="text-red-700 text-sm">{erro}</p>}

                    <div>
                        <label className="block text-sm mb-1">E-mail</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-md p-3"
                            autoComplete="email"
                            maxLength={254}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Senha</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full border rounded-md p-3"
                            autoComplete="current-password"
                            maxLength={128}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={enviando}
                        className="w-full bg-red-700 text-white py-3 rounded-md font-semibold hover:bg-red-800 transition"
                    >
                        {enviando ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Ainda não tem conta?{" "}
                    <Link href="/cadastro" className="text-red-700 font-medium">
                        Cadastre-se
                    </Link>
                </p>
            </div>
                
        </main>
    )
}
