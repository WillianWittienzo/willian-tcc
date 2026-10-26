import type { ReactNode } from "react";
import type { Pedido } from "@/client/pedidoClient";
import { criarTimeline } from "@/lib/acompanhamento";
import { FUSO_HORARIO_PEDIDOS, ROTULOS_STATUS } from "@/lib/filtrosPedido";

type PedidoCardProps = {
  pedido: Pedido;
  children?: ReactNode;
  exibirAcompanhamento?: boolean;
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

function formatarTelefone(telefone: string) {
  return telefone.length === 11
    ? telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
    : telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
}

function formatarCep(cep: string) {
  return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

export function PedidoCard({ pedido, children, exibirAcompanhamento = false }: PedidoCardProps) {
  const quantidadePizzas = pedido.itens.reduce((total, item) => total + item.quantidade, 0);
  const timeline = criarTimeline(pedido.status, pedido.metodoEntrega);

  return (
    <article className="space-y-3 rounded-xl bg-white p-4 shadow">
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

      <details open={exibirAcompanhamento ? undefined : true} className="border-t pt-3">
        {exibirAcompanhamento && (
          <summary className="cursor-pointer font-semibold text-red-700">Visualizar detalhes</summary>
        )}
        <div className={`space-y-3 ${exibirAcompanhamento ? "mt-3" : ""}`}>
          {pedido.nomeCliente && pedido.telefone ? (
            <div className="text-sm">
              <p><span className="font-semibold">Cliente:</span> {pedido.nomeCliente} · {formatarTelefone(pedido.telefone)}</p>
              <p><span className="font-semibold">Método:</span> {pedido.metodoEntrega === "Retirada" ? "Retirada no local" : pedido.metodoEntrega ?? "Método não registrado"}</p>
              {pedido.metodoEntrega === "Entrega" && pedido.cep && pedido.rua && pedido.numero && pedido.bairro && (
                <details className="mt-2 rounded-md bg-gray-50 p-2">
                  <summary className="cursor-pointer font-semibold text-red-700">Ver dados da entrega</summary>
                  <div className="mt-2 space-y-1 text-gray-600">
                    <p>CEP {formatarCep(pedido.cep)}</p>
                    <p>{pedido.rua}, {pedido.numero} · {pedido.bairro}</p>
                    {pedido.complemento && <p>Complemento: {pedido.complemento}</p>}
                    {pedido.referencia && <p>Referência: {pedido.referencia}</p>}
                  </div>
                </details>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Dados do cliente e método não registrados</p>
          )}

          <div className="divide-y border-t">
            {pedido.itens.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 py-2">
                <div>
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
                    <p className="mt-1 rounded bg-amber-50 p-2 text-sm text-amber-900">
                      Observação: {item.observacao}
                    </p>
                  )}
                </div>
                <div className="text-right text-sm">
                  <p>{moeda.format(item.precoUnitario)} {item.borda ? "+ borda" : "cada"}</p>
                  <p className="font-semibold">
                    {moeda.format((item.precoUnitario + item.precoBorda) * item.quantidade)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 border-t pt-3">
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
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxa de entrega</span>
              <span>{moeda.format(pedido.taxaEntrega)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{moeda.format(pedido.valorTotal)}</span>
            </div>
          </div>
        </div>
      </details>

      {children}
    </article>
  );
}
