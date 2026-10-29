import type { ReactNode } from "react";
import { CircleDollarSign, Info, MapPin, UtensilsCrossed } from "lucide-react";
import type { Pedido } from "@/client/pedidoClient";
import { criarTimeline } from "@/lib/acompanhamento";
import { FUSO_HORARIO_PEDIDOS, ROTULOS_STATUS } from "@/lib/filtrosPedido";

type PedidoCardProps = {
  pedido: Pedido;
  children?: ReactNode;
  exibirAcompanhamento?: boolean;
  modoKanban?: boolean;
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const estiloStatus: Record<Pedido["status"], string> = {
  Pendente: "bg-amber-100 text-amber-800",
  EmPreparo: "bg-orange-100 text-orange-800",
  SaiuParaEntrega: "bg-blue-100 text-blue-800",
  Entregue: "bg-green-100 text-green-800",
  Cancelado: "bg-gray-200 text-gray-700",
};

export function formatarTelefone(telefone: string) {
  return telefone.length === 11
    ? telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
    : telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
}

function formatarCep(cep: string) {
  return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

export function PedidoCard({ pedido, children, exibirAcompanhamento = false, modoKanban = false }: PedidoCardProps) {
  const quantidadePizzas = pedido.itens.reduce((total, item) => total + item.quantidade, 0);
  const timeline = criarTimeline(pedido.status, pedido.metodoEntrega);

  return (
    <article className={`space-y-4 rounded-xl bg-white ${modoKanban ? "border border-slate-200 p-4 shadow-sm" : "p-4 shadow"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Pedido #{pedido.id}</h3>
          <p className="text-sm text-gray-500">
            {new Date(pedido.criadoEm).toLocaleString("pt-BR", { timeZone: FUSO_HORARIO_PEDIDOS })}
          </p>
        </div>

        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${estiloStatus[pedido.status]}`}>
          {ROTULOS_STATUS[pedido.status]}
        </span>
      </div>

      {exibirAcompanhamento && (
        <>
          <dl className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-gray-500">Quantidade</dt>
              <dd className="font-semibold">{quantidadePizzas} pizza(s)</dd>
            </div>
            <div>
              <dt className="text-gray-500">Atendimento</dt>
              <dd className="font-semibold">{pedido.metodoEntrega === "Retirada" ? "Retirada" : pedido.metodoEntrega ?? "Não registrado"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Valor total</dt>
              <dd className="font-semibold">{moeda.format(pedido.valorTotal)}</dd>
            </div>
          </dl>

          <section aria-label="Andamento do pedido">
            {timeline.cancelado ? (
              <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-center font-semibold text-red-800">
                Pedido cancelado
              </p>
            ) : (
              <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {timeline.etapas.map((etapa) => (
                  <li
                    key={etapa.rotulo}
                    className={`rounded-lg border p-2 text-center text-xs ${
                      etapa.atual
                        ? "border-red-600 bg-red-50 font-bold text-red-800"
                        : etapa.concluida
                          ? "border-green-500 bg-green-50 font-semibold text-green-800"
                          : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    {etapa.rotulo}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}

      <details open={exibirAcompanhamento ? undefined : true} className="border-t border-slate-200 pt-3">
        <summary className={exibirAcompanhamento ? "cursor-pointer font-semibold text-red-700" : "hidden"}>
          {exibirAcompanhamento ? "Visualizar detalhes" : "Detalhes do pedido"}
        </summary>
        <div className={`space-y-3 ${exibirAcompanhamento ? "mt-3" : ""}`}>
          {pedido.nomeCliente && pedido.telefone ? (
            <section className={`text-sm ${modoKanban ? "rounded-xl border border-slate-200 bg-slate-50 p-3" : ""}`} aria-label="Informações do cliente">
              {modoKanban && (
                <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-700">
                  <Info size={17} aria-hidden="true" /> Informações gerais
                </h4>
              )}
              <p><span className="font-semibold">Cliente:</span> {pedido.nomeCliente} · {formatarTelefone(pedido.telefone)}</p>
              <p><span className="font-semibold">Método:</span> {pedido.metodoEntrega === "Retirada" ? "Retirada no local" : pedido.metodoEntrega ?? "Método não registrado"}</p>
              {pedido.metodoEntrega === "Entrega" && pedido.cep && pedido.rua && pedido.numero && pedido.bairro && (
                <details className={`mt-2 rounded-lg p-2.5 ${modoKanban ? "border border-slate-200 bg-white" : "bg-gray-50"}`}>
                  <summary className="cursor-pointer font-semibold text-red-700">
                    <span className="inline-flex items-center gap-1.5"><MapPin size={15} aria-hidden="true" /> Ver dados da entrega</span>
                  </summary>
                  <div className="mt-2 space-y-1 text-gray-600">
                    <p>CEP {formatarCep(pedido.cep)}</p>
                    <p>{pedido.rua}, {pedido.numero} · {pedido.bairro}</p>
                    {pedido.complemento && <p>Complemento: {pedido.complemento}</p>}
                    {pedido.referencia && <p>Referência: {pedido.referencia}</p>}
                  </div>
                </details>
              )}
            </section>
          ) : (
            <p className="text-sm text-gray-500">Dados do cliente e método não registrados</p>
          )}

          <section className={modoKanban ? "rounded-xl border border-slate-200 bg-slate-50 p-3" : "divide-y border-t"} aria-label="Itens do pedido">
            {modoKanban && (
              <h4 className="flex items-center gap-2 py-3 font-bold text-slate-700">
                <UtensilsCrossed size={17} aria-hidden="true" /> Itens do pedido
              </h4>
            )}
            {pedido.itens.map((item) => (
              <div key={item.id} className={modoKanban ? "mt-2 min-w-0 rounded-lg border border-slate-200 bg-white p-3" : "flex justify-between gap-4 py-2"}>
                <div className="min-w-0">
                  <p className="font-semibold">{item.nomeProduto}</p>
                  <p className="text-sm text-gray-500">
                    {item.tamanho} · {item.quantidade} unidade(s)
                  </p>
                  {item.borda && (
                    <p className="text-sm text-gray-500">
                      Borda: {item.borda} (+{moeda.format(item.precoBorda)})
                    </p>
                  )}
                  {item.observacao && (
                    <p className="mt-2 break-words rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-900">
                      Observação: {item.observacao}
                    </p>
                  )}
                </div>
                <div className={`text-sm ${modoKanban ? "mt-3 flex items-end justify-between gap-3 border-t border-slate-100 pt-2" : "text-right"}`}>
                  <p>{moeda.format(item.precoUnitario)} {item.borda ? "+ borda" : "cada"}</p>
                  <p className="font-semibold">
                    {moeda.format((item.precoUnitario + item.precoBorda) * item.quantidade)}
                  </p>
                </div>
              </div>
            ))}
          </section>

          <section className={modoKanban ? "space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3" : "space-y-1 border-t pt-3"} aria-label="Resumo financeiro">
            {modoKanban && (
              <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-700">
                <CircleDollarSign size={18} aria-hidden="true" /> Resumo financeiro
              </h4>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Pagamento</span>
              <span>{pedido.recebimento?.formaPagamento ?? "Não registrado"}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Recebimento</span>
              <span>{pedido.recebimento?.status ?? "Não registrado"}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Valor do recebimento</span>
              <span>{pedido.recebimento ? moeda.format(pedido.recebimento.valor) : "Não registrado"}</span>
            </div>
            {pedido.recebimento?.formaPagamento === "Dinheiro" && pedido.recebimento.precisaTroco !== null && (
              <>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Precisa de troco</span>
                  <span>{pedido.recebimento.precisaTroco ? "Sim" : "Não"}</span>
                </div>
                {pedido.recebimento.precisaTroco && pedido.recebimento.valorParaTroco !== null && pedido.recebimento.valorTroco !== null && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Valor entregue em dinheiro</span>
                      <span>{moeda.format(pedido.recebimento.valorParaTroco)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                      <span>Troco</span>
                      <span>{moeda.format(pedido.recebimento.valorTroco)}</span>
                    </div>
                  </>
                )}
              </>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxa de entrega</span>
              <span>{moeda.format(pedido.taxaEntrega)}</span>
            </div>
            <div className={`flex justify-between gap-3 text-lg font-bold ${modoKanban ? "mt-3 rounded-lg border border-slate-200 bg-white p-2.5" : ""}`}>
              <span>Total</span>
              <span>{moeda.format(pedido.valorTotal)}</span>
            </div>
          </section>
        </div>
      </details>

      {children}
    </article>
  );
}
