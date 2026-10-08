"use client";

import { useEffect, useState, type FormEvent } from "react";
import { acompanharPedido, type PedidoPublico } from "@/client/pedidoClient";
import { criarTimeline } from "@/lib/acompanhamento";
import { FUSO_HORARIO_PEDIDOS, ROTULOS_STATUS } from "@/lib/filtrosPedido";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function AcompanharPedidoPage() {
  const [pedidoId, setPedidoId] = useState("");
  const [telefone, setTelefone] = useState("");
  const [pedido, setPedido] = useState<PedidoPublico | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const numero = new URLSearchParams(window.location.search).get("pedido");
    if (numero && /^\d{1,10}$/.test(numero)) setPedidoId(numero);
  }, []);

  async function consultar(event: FormEvent) {
    event.preventDefault();
    setCarregando(true);
    setErro("");
    setPedido(null);
    try {
      setPedido(await acompanharPedido(pedidoId, telefone));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Pedido não encontrado com os dados informados.");
    } finally {
      setCarregando(false);
    }
  }

  const timeline = pedido ? criarTimeline(pedido.status, pedido.metodoEntrega) : null;

  return (
    <main className="mx-auto min-h-[70vh] max-w-4xl px-6 pb-16 pt-28">
      <h1 className="text-3xl font-bold">Acompanhar Pedido</h1>
      <p className="mt-2 text-gray-600">Informe o número do pedido e o mesmo telefone usado na compra.</p>

      <form onSubmit={consultar} className="mt-6 grid gap-4 rounded-xl bg-white p-5 shadow sm:grid-cols-[1fr_2fr_auto] sm:items-end">
        <label className="text-sm font-semibold">
          Número do pedido
          <input value={pedidoId} onChange={(event) => setPedidoId(event.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" maxLength={10} className="mt-1 w-full rounded-md border p-2" required />
        </label>
        <label className="text-sm font-semibold">
          Telefone
          <input value={telefone} onChange={(event) => setTelefone(event.target.value)} inputMode="tel" maxLength={25} placeholder="(11) 99999-9999" className="mt-1 w-full rounded-md border p-2" required />
        </label>
        <button type="submit" disabled={carregando} className="rounded-md bg-red-600 px-5 py-2 font-semibold text-white disabled:opacity-50">
          {carregando ? "Consultando..." : "Consultar"}
        </button>
      </form>

      {erro && <p className="mt-5 rounded-md bg-red-100 p-4 text-red-800">{erro}</p>}

      {pedido && timeline && (
        <article className="mt-6 space-y-6 rounded-xl bg-white p-5 shadow">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Pedido #{pedido.id}</h2>
              <p className="text-sm text-gray-500">{new Date(pedido.criadoEm).toLocaleString("pt-BR", { timeZone: FUSO_HORARIO_PEDIDOS })}</p>
            </div>
            <span className={`rounded-full px-3 py-1 font-semibold ${pedido.status === "Cancelado" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
              {ROTULOS_STATUS[pedido.status]}
            </span>
          </header>

          <section>
            <h3 className="font-bold">Progresso</h3>
            <p className={`mt-1 text-sm ${timeline.cancelado ? "text-red-700" : "text-gray-600"}`}>{timeline.estimativa}</p>
            {!timeline.cancelado && <p className="mt-1 text-xs text-gray-500">Esta é uma estimativa visual. O status real é atualizado pela pizzaria.</p>}
            <ol className="mt-4 grid gap-3 sm:grid-cols-4">
              {timeline.etapas.map((etapa) => (
                <li key={etapa.rotulo} className={`rounded-lg border p-3 text-center text-sm ${etapa.atual ? "border-red-600 bg-red-50 font-bold text-red-800" : etapa.concluida ? "border-green-500 bg-green-50 text-green-800" : "text-gray-400"}`}>
                  {etapa.rotulo}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="font-bold">Itens</h3>
            <div className="mt-2 divide-y">
              {pedido.itens.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 py-2 text-sm">
                  <span>{item.quantidade}× {item.nomeProduto} · {item.tamanho}{item.borda ? ` · Borda ${item.borda}` : ""}</span>
                  <span>{moeda.format((item.precoUnitario + item.precoBorda) * item.quantidade)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between"><span>Método</span><span>{pedido.metodoEntrega === "Retirada" ? "Retirada no local" : pedido.metodoEntrega ?? "Não registrado"}</span></div>
            <div className="flex justify-between"><span>Forma de pagamento</span><span>{pedido.recebimento?.formaPagamento ?? "Não registrado"}</span></div>
            <div className="flex justify-between"><span>Recebimento</span><span>{pedido.recebimento?.status ?? "Não registrado"}</span></div>
            <div className="flex justify-between"><span>Taxa</span><span>{moeda.format(pedido.taxaEntrega)}</span></div>
            <div className="flex justify-between pt-1 text-lg font-bold"><span>Total</span><span>{moeda.format(pedido.valorTotal)}</span></div>
          </section>
        </article>
      )}
    </main>
  );
}
