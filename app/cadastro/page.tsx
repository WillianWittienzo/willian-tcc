"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cadastrar } from "@/client/authClient";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro("");

    if (senha !== confirmacaoSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    setEnviando(true);
    try {
      await cadastrar({ nome, email, telefone, senha });
      router.push("/login");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao cadastrar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-28">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-800 text-2xl text-white">
            <Image src="/logo.png/fogo3.png" alt="Brasa Quente" width={40} height={40} />
          </div>
        </div>

        <h1 className="mb-2 text-center text-3xl font-bold">CRIE SUA CONTA</h1>
        <p className="mb-6 text-center text-gray-500">Cadastre seus dados de cliente</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}

          <div>
            <label htmlFor="nome" className="mb-1 block text-sm">Nome completo</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="w-full rounded-md border p-3"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border p-3"
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>

          <div>
            <label htmlFor="telefone" className="mb-1 block text-sm">Telefone com DDD</label>
            <input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              className="w-full rounded-md border p-3"
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              inputMode="tel"
              maxLength={25}
              required
            />
          </div>

          <div>
            <label htmlFor="senha" className="mb-1 block text-sm">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              className="w-full rounded-md border p-3"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmacaoSenha" className="mb-1 block text-sm">Confirme a senha</label>
            <input
              id="confirmacaoSenha"
              type="password"
              value={confirmacaoSenha}
              onChange={(event) => setConfirmacaoSenha(event.target.value)}
              className="w-full rounded-md border p-3"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-red-700 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-red-700">Faça login</Link>
        </p>
      </div>
    </main>
  );
}
