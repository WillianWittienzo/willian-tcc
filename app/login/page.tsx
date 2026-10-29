"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation"
import { criarUrlAutenticacao, obterRetornoCompra } from "@/lib/checkout"
import { CampoSenha } from "@/components/auth/CampoSenha"

export default function LoginPage() {

    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")

    const { login } = useAuth()
    const router = useRouter()

    const [erro, setErro] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [aviso, setAviso] = useState("")

    useEffect(() => {
        const cadastro = new URLSearchParams(window.location.search).get("cadastro")
        const timer = window.setTimeout(() => {
            if (cadastro === "enviado") setAviso("Conta criada. Confira seu e-mail para concluir a verificação.")
            if (cadastro === "sem-smtp") setAviso("Conta criada. O SMTP não está configurado, então o e-mail de verificação não foi enviado.")
        }, 0)
        return () => window.clearTimeout(timer)
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro("")
        setEnviando(true)

        try {
            const usuario = await login(email, senha)
            const retorno = obterRetornoCompra(window.location.search)
            router.replace(usuario.papel === "Admin" ? "/admin" : retorno ?? "/pedidos")
            router.refresh()
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

                    {aviso && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900" role="status">{aviso}</p>}
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

                    <CampoSenha id="senhaLogin" label="Senha" value={senha} onChange={setSenha} autoComplete="current-password" />

                    <Link href="/esqueci-senha" className="block text-right text-sm font-semibold text-red-700">Esqueceu sua senha?</Link>

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
                    <Link
                        href="/cadastro"
                        onClick={(event) => {
                            if (!obterRetornoCompra(window.location.search)) return
                            event.preventDefault()
                            router.push(criarUrlAutenticacao("/cadastro"))
                        }}
                        className="text-red-700 font-medium"
                    >
                        Cadastre-se
                    </Link>
                </p>
            </div>
                
        </main>
    )
}
