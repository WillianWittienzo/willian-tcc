"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cadastrar } from "@/client/authClient";
import { CampoSenha } from "@/components/auth/CampoSenha";
import { criarUrlAutenticacao, obterRetornoCompra } from "@/lib/checkout";
import { formatarCpf } from "@/lib/cpf";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
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
      const resultado = await cadastrar({ nome, email, telefone, cpf, senha });
      const destino = obterRetornoCompra(window.location.search) ? criarUrlAutenticacao("/login") : "/login";
      router.replace(`${destino}${destino.includes("?") ? "&" : "?"}cadastro=${resultado.emailEnviado ? "enviado" : "sem-smtp"}`);
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
            <label htmlFor="cpf" className="mb-1 block text-sm">CPF</label>
            <input
              id="cpf"
              type="text"
              value={cpf}
              onChange={(event) => setCpf(formatarCpf(event.target.value))}
              className="w-full rounded-md border p-3"
              placeholder="000.000.000-00"
              autoComplete="off"
              inputMode="numeric"
              maxLength={14}
              required
            />
            <p className="mt-1 text-xs text-gray-500">Validação matemática; não confirma titularidade ou existência do documento.</p>
          </div>

          <CampoSenha id="senha" label="Senha" value={senha} onChange={setSenha} autoComplete="new-password" mostrarOrientacao />

          <CampoSenha id="confirmacaoSenha" label="Confirme a senha" value={confirmacaoSenha} onChange={setConfirmacaoSenha} autoComplete="new-password" />

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
          <Link
            href="/login"
            onClick={(event) => {
              if (!obterRetornoCompra(window.location.search)) return;
              event.preventDefault();
              router.push(criarUrlAutenticacao("/login"));
            }}
            className="font-medium text-red-700"
          >
            Faça login
          </Link>
        </p>
      </div>
    </main>
  );
}
