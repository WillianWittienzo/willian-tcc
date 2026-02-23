"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function CadastroPage() {

    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        console.log(nome, email, senha)
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
                    CRIE SUA CONTA
                </h1>

                <p className="text-center text-gray-500 mb-6">
                    Cadastre-se para fazer seus pedidos
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm mb-1">Nome Completo</label>
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full border rounded-md p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-md p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Senha</label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full border rounded-md p-3"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-700 text-white py-3 rounded-md font-semibold hover:bg-red-800 transition"
                    >
                        Criar Conta
                    </button>

                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Já tem conta?{" "}
                    <Link href="/login" className="text-red-700 font-medium">
                        Faça login
                    </Link>
                </p>

            </div>

        </main>
    )
}