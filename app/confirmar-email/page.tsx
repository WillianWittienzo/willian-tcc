"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { confirmarEmail } from "@/client/authClient";

export default function ConfirmarEmailPage() {
  const [mensagem, setMensagem] = useState("Confirmando seu e-mail...");
  const [erro, setErro] = useState(false);
  const iniciou = useRef(false);

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    confirmarEmail(token)
      .then((resultado) => setMensagem(resultado.mensagem))
      .catch((error) => {
        setErro(true);
        setMensagem(error instanceof Error ? error.message : "Não foi possível confirmar o e-mail");
      });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-24">
      <section className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold">Confirmação de e-mail</h1>
        <p className={`mt-4 rounded-md p-4 ${erro ? "bg-red-100 text-red-800" : "bg-green-50 text-green-800"}`} role={erro ? "alert" : "status"}>{mensagem}</p>
        <Link href="/login" className="mt-6 inline-block rounded-md bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800">Voltar ao login</Link>
      </section>
    </main>
  );
}
