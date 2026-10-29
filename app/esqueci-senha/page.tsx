"use client";

import Link from "next/link";
import { useState } from "react";
import { solicitarRecuperacaoSenha } from "@/client/authClient";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    setEnviando(true);
    setErro(false);
    try {
      const resultado = await solicitarRecuperacaoSenha(email);
      setMensagem(resultado.emailConfigurado
        ? resultado.mensagem
        : `${resultado.mensagem} O envio SMTP não está configurado neste ambiente.`);
    } catch (error) {
      setErro(true);
      setMensagem(error instanceof Error ? error.message : "Não foi possível solicitar a recuperação");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-24">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Recuperar senha</h1>
        <p className="mt-2 text-sm text-gray-600">Informe seu e-mail. A resposta será a mesma exista ou não uma conta.</p>
        <form onSubmit={enviar} className="mt-5 space-y-4">
          {mensagem && <p className={`rounded-md p-3 text-sm ${erro ? "bg-red-100 text-red-800" : "bg-green-50 text-green-800"}`} role={erro ? "alert" : "status"}>{mensagem}</p>}
          <label className="block text-sm font-semibold">E-mail
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} required className="mt-1 w-full rounded-md border p-3 font-normal" />
          </label>
          <button type="submit" disabled={enviando} className="w-full rounded-md bg-red-700 py-3 font-semibold text-white disabled:opacity-50">{enviando ? "Enviando..." : "Solicitar recuperação"}</button>
        </form>
        <Link href="/login" className="mt-5 block text-center text-sm font-semibold text-red-700">Voltar ao login</Link>
      </section>
    </main>
  );
}
