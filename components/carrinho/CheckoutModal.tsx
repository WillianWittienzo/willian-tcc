"use client";

import { useState, type FormEvent } from "react";
import type { CartItem } from "@/app/context/CartContext";
import {
  DadosEntregaInvalidosError,
  FORMAS_PAGAMENTO,
  METODOS_ENTREGA,
  normalizarDadosCheckout,
  type DadosCheckout,
  type FormaPagamento,
} from "@/lib/checkout";
import { calcularTaxaEntregaEmCentavos, type MetodoEntrega } from "@/lib/pedido";

type CheckoutModalProps = {
  enviando: boolean;
  itens: CartItem[];
  subtotal: number;
  onCancelar: () => void;
  onConfirmar: (dados: DadosCheckout) => Promise<void>;
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

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CheckoutModal({ enviando, itens, subtotal, onCancelar, onConfirmar }: CheckoutModalProps) {
  const [campos, setCampos] = useState(camposIniciais);
  const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega | "">("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | "">("");
  const [erro, setErro] = useState("");

  function alterar(campo: keyof typeof camposIniciais, valor: string) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
  }

  async function confirmar(event: FormEvent) {
    event.preventDefault();
    setErro("");
    try {
      const dados = normalizarDadosCheckout({ ...campos, metodoEntrega, formaPagamento });
      await onConfirmar(dados);
    } catch (error) {
      setErro(
        error instanceof DadosEntregaInvalidosError || error instanceof Error
          ? error.message
          : "Não foi possível confirmar o pedido",
      );
    }
  }

  const entrega = metodoEntrega === "Entrega";
  const taxa = metodoEntrega
    ? calcularTaxaEntregaEmCentavos(Math.round(subtotal * 100), metodoEntrega) / 100
    : 0;
  const desconto = itens.reduce(
    (total, item) => total + Math.max(0, item.precoOriginal - item.preco) * item.quantidade,
    0,
  );
  const classeCampo = "mt-1 w-full rounded-md border p-2 outline-none focus:border-red-600";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-checkout">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
        <h2 id="titulo-checkout" className="text-2xl font-bold">Finalizar pedido</h2>
        <p className="mt-1 text-sm text-gray-500">Informe seus dados, entrega e forma de pagamento.</p>

        <form onSubmit={confirmar} className="mt-5 grid gap-4 sm:grid-cols-2">
          {erro && <p className="rounded-md bg-red-100 p-3 text-sm text-red-800 sm:col-span-2">{erro}</p>}

          <label className="text-sm font-semibold sm:col-span-2">
            Nome completo *
            <input value={campos.nomeCliente} onChange={(event) => alterar("nomeCliente", event.target.value)} maxLength={100} autoComplete="name" className={classeCampo} required />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Telefone *
            <input value={campos.telefone} onChange={(event) => alterar("telefone", event.target.value)} maxLength={25} inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" className={classeCampo} required />
          </label>

          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold">Método de entrega *</legend>
            <div className="mt-2 flex flex-wrap gap-4">
              {METODOS_ENTREGA.map((metodo) => (
                <label key={metodo} className="flex items-center gap-2 rounded-md border px-4 py-3">
                  <input type="radio" name="metodoEntrega" value={metodo} checked={metodoEntrega === metodo} onChange={() => setMetodoEntrega(metodo)} required />
                  {metodo === "Retirada" ? "Retirada no local" : metodo}
                </label>
              ))}
            </div>
          </fieldset>

          {entrega && (
            <>
              <label className="text-sm font-semibold">
                CEP *
                <input value={campos.cep} onChange={(event) => alterar("cep", event.target.value)} maxLength={9} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" className={classeCampo} required />
              </label>
              <label className="text-sm font-semibold">
                Número *
                <input value={campos.numero} onChange={(event) => alterar("numero", event.target.value)} maxLength={20} className={classeCampo} required />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Rua *
                <input value={campos.rua} onChange={(event) => alterar("rua", event.target.value)} maxLength={150} autoComplete="street-address" className={classeCampo} required />
              </label>
              <label className="text-sm font-semibold">
                Bairro *
                <input value={campos.bairro} onChange={(event) => alterar("bairro", event.target.value)} maxLength={100} className={classeCampo} required />
              </label>
              <label className="text-sm font-semibold">
                Complemento
                <input value={campos.complemento} onChange={(event) => alterar("complemento", event.target.value)} maxLength={150} className={classeCampo} />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Ponto de referência
                <input value={campos.referencia} onChange={(event) => alterar("referencia", event.target.value)} maxLength={200} className={classeCampo} />
              </label>
            </>
          )}

          <label className="text-sm font-semibold sm:col-span-2">
            Forma de pagamento *
            <select value={formaPagamento} onChange={(event) => setFormaPagamento(event.target.value as FormaPagamento)} className={classeCampo} required>
              <option value="">Selecione</option>
              {FORMAS_PAGAMENTO.map((forma) => <option key={forma} value={forma}>{forma}</option>)}
            </select>
          </label>

          <section className="rounded-lg bg-gray-50 p-4 sm:col-span-2" aria-label="Resumo do pedido">
            <h3 className="font-bold">Resumo</h3>
            <div className="mt-2 divide-y text-sm">
              {itens.map((item) => (
                <div key={`${item.id}-${item.tamanho}-${item.borda}`} className="flex justify-between gap-3 py-2">
                  <span>{item.quantidade}× {item.nome} ({item.tamanho}) · {item.borda}</span>
                  <span>{moeda.format((item.preco + item.precoBorda) * item.quantidade)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-1 border-t pt-2 text-sm">
              <div className="flex justify-between"><span>Descontos</span><span>{desconto > 0 ? `-${moeda.format(desconto)}` : moeda.format(0)}</span></div>
              <div className="flex justify-between"><span>Subtotal</span><span>{moeda.format(subtotal)}</span></div>
              <div className="flex justify-between"><span>{metodoEntrega === "Retirada" ? "Retirada" : "Entrega"}</span><span>{metodoEntrega ? (taxa === 0 ? "Grátis" : moeda.format(taxa)) : "Selecione"}</span></div>
              <div className="flex justify-between"><span>Pagamento</span><span>{formaPagamento || "Selecione"}</span></div>
              <div className="flex justify-between pt-1 text-base font-bold"><span>Total estimado</span><span>{moeda.format(subtotal + taxa)}</span></div>
              <p className="pt-1 text-xs text-gray-500">Os valores são recalculados e validados pelo servidor ao confirmar.</p>
            </div>
          </section>

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
