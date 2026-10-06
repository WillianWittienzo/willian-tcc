"use client";

import { useState } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { CiClock2 } from "react-icons/ci";
import { FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

const TELEFONE_WHATSAPP = "5511999999999";

const contactInfo = [
  { icon: FaMapMarkerAlt, title: "Endereço", content: "Rua das Pizzas, 123\nCentro - São Paulo, SP" },
  { icon: FaPhoneAlt, title: "Telefone", content: "(11) 99999-9999\n(11) 3333-3333" },
  { icon: CiClock2, title: "Horário", content: "Ter - Dom: 18h às 23h\nSegunda: Fechado" },
  { icon: AiOutlineMail, title: "E-mail", content: "contato@brasaquente.com.br" },
];

export default function ContatoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  function abrirWhatsApp(event: React.FormEvent) {
    event.preventDefault();
    const texto = [
      `Olá, meu nome é ${nome.trim()}.`,
      email.trim() ? `Meu e-mail é ${email.trim()}.` : "",
      mensagem.trim(),
    ].filter(Boolean).join("\n");
    window.open(
      `https://wa.me/${TELEFONE_WHATSAPP}?text=${encodeURIComponent(texto)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="py-20">
      <section>
        <div className="mx-auto max-w-8xl py-20 -mt-4 bg-[hsl(0deg_83.78%_21.76%)]">
          <h1 className="text-6xl font-bold text-amber-50 flex justify-center gap-2">
            Fale <span className="text-amber-500">Conosco</span>
          </h1>
          <p className="text-amber-50 flex justify-center text-sm">Entre em contato com a Brasa Quente</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-10 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-6 shadow transition-all duration-200 hover:-translate-y-1">
          <h2 className="text-3xl font-bold">INFORMAÇÕES DE CONTATO</h2>
          <p className="mt-4 text-zinc-600">Entre em contato conosco por qualquer um dos canais abaixo.</p>
          <div className="mt-8 space-y-6">
            {contactInfo.map((info) => (
              <div key={info.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                  <info.icon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{info.title}</h3>
                  <p className="mt-1 whitespace-pre-line text-sm text-zinc-600">{info.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow transition-all duration-200 hover:-translate-y-1">
          <h2 className="text-3xl font-bold">Contato</h2>
          <p className="mt-4 text-zinc-600">Preencha os dados para continuar a conversa pelo WhatsApp.</p>
          <form onSubmit={abrirWhatsApp} className="mt-8 space-y-4">
            <input type="text" maxLength={100} placeholder="Nome" value={nome} onChange={(event) => setNome(event.target.value)} className="w-full rounded-md border p-3" required />
            <input type="email" maxLength={254} placeholder="E-mail (opcional)" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border p-3" />
            <textarea maxLength={1000} placeholder="Mensagem" value={mensagem} onChange={(event) => setMensagem(event.target.value)} className="w-full rounded-md border p-3" rows={4} required />
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-md bg-green-700 py-3 text-white hover:bg-green-800">
              <FaWhatsapp /> Abrir WhatsApp
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
