"use client";

import Link from "next/link";
import { useState } from "react";
import { CampoSenha } from "@/components/auth/CampoSenha";
import { redefinirSenha } from "@/client/authClient";

export default function RedefinirSenhaPage() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    setEnviando(true);
    setErro(false);
    try {
      const token = new URLSearchParams(window.location.search).get("token") ?? "";
      const resultado = await redefinirSenha(token, novaSenha, confirmarNovaSenha);
      setConcluido(true);
      setMensagem(resultado.mensagem);
    } catch (error) {
      setErro(true);
      setMensagem(error instanceof Error ? error.message : "Não foi possível redefinir a senha");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-24">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Definir nova senha</h1>
        {mensagem && <p className={`mt-4 rounded-md p-3 text-sm ${erro ? "bg-red-100 text-red-800" : "bg-green-50 text-green-800"}`} role={erro ? "alert" : "status"}>{mensagem}</p>}
        {!concluido && (
          <form onSubmit={enviar} className="mt-5 space-y-4">
            <CampoSenha id="novaSenhaRecuperacao" label="Nova senha" value={novaSenha} onChange={setNovaSenha} autoComplete="new-password" mostrarOrientacao />
            <CampoSenha id="confirmarSenhaRecuperacao" label="Confirmar nova senha" value={confirmarNovaSenha} onChange={setConfirmarNovaSenha} autoComplete="new-password" />
            <button type="submit" disabled={enviando} className="w-full rounded-md bg-red-700 py-3 font-semibold text-white disabled:opacity-50">{enviando ? "Redefinindo..." : "Redefinir senha"}</button>
          </form>
        )}
        <Link href="/login" className="mt-5 block text-center text-sm font-semibold text-red-700">Voltar ao login</Link>
      </section>
    </main>
  );
}
