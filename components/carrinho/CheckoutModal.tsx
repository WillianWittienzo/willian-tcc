"use client";

import { useState, type FormEvent } from "react";
import {
  DadosEntregaInvalidosError,
  normalizarDadosEntrega,
  type DadosEntrega,
} from "@/lib/checkout";

type CheckoutModalProps = {
  enviando: boolean;
  onCancelar: () => void;
  onConfirmar: (dados: DadosEntrega) => Promise<void>;
};

const camposIniciais = {
  nomeCliente: "",
  telefone: "",
  cep: "",
  rua: "",
  numero: "",
  bairro: "",
  complemento: "",
  referencia: "",
};

export function CheckoutModal({ enviando, onCancelar, onConfirmar }: CheckoutModalProps) {
  const [campos, setCampos] = useState(camposIniciais);
  const [erro, setErro] = useState("");

  function alterar(campo: keyof typeof camposIniciais, valor: string) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
  }

  async function confirmar(event: FormEvent) {
    event.preventDefault();
    setErro("");
    try {
      const dados = normalizarDadosEntrega(campos);
      await onConfirmar(dados);
    } catch (error) {
      setErro(
        error instanceof DadosEntregaInvalidosError || error instanceof Error
          ? error.message
          : "Não foi possível confirmar o pedido",
      );
    }
  }

  const classeCampo = "mt-1 w-full rounded-md border p-2 outline-none focus:border-red-600";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-checkout">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
        <h2 id="titulo-checkout" className="text-2xl font-bold">Dados para entrega</h2>
        <p className="mt-1 text-sm text-gray-500">Preencha os dados usados neste pedido.</p>

        <form onSubmit={confirmar} className="mt-5 grid gap-4 sm:grid-cols-2">
          {erro && <p className="rounded-md bg-red-100 p-3 text-sm text-red-800 sm:col-span-2">{erro}</p>}

          <label className="text-sm font-semibold sm:col-span-2">
            Nome completo *
            <input value={campos.nomeCliente} onChange={(event) => alterar("nomeCliente", event.target.value)} maxLength={100} autoComplete="name" className={classeCampo} required />
          </label>
          <label className="text-sm font-semibold">
            Telefone *
            <input value={campos.telefone} onChange={(event) => alterar("telefone", event.target.value)} maxLength={25} inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" className={classeCampo} required />
          </label>
          <label className="text-sm font-semibold">
            CEP *
            <input value={campos.cep} onChange={(event) => alterar("cep", event.target.value)} maxLength={9} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" className={classeCampo} required />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Rua *
            <input value={campos.rua} onChange={(event) => alterar("rua", event.target.value)} maxLength={150} autoComplete="street-address" className={classeCampo} required />
          </label>
          <label className="text-sm font-semibold">
            Número *
            <input value={campos.numero} onChange={(event) => alterar("numero", event.target.value)} maxLength={20} className={classeCampo} required />
          </label>
          <label className="text-sm font-semibold">
            Bairro *
            <input value={campos.bairro} onChange={(event) => alterar("bairro", event.target.value)} maxLength={100} className={classeCampo} required />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Complemento
            <input value={campos.complemento} onChange={(event) => alterar("complemento", event.target.value)} maxLength={150} className={classeCampo} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Ponto de referência
            <input value={campos.referencia} onChange={(event) => alterar("referencia", event.target.value)} maxLength={200} className={classeCampo} />
          </label>

          <div className="mt-2 flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancelar} disabled={enviando} className="rounded-md border px-5 py-2 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={enviando} className="rounded-md bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {enviando ? "Confirmando..." : "Confirmar Pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
