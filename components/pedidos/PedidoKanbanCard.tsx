"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Clock3, CreditCard, FileText, Phone, ReceiptText, Store, Truck, UserRound, UtensilsCrossed, WalletCards } from "lucide-react";
import type { Pedido, StatusRecebimento } from "@/client/pedidoClient";
import { formatarTelefone, PedidoCard } from "@/components/pedidos/PedidoCard";
import { FUSO_HORARIO_PEDIDOS, minutosAguardandoPedido, pedidoPendenteAntigo, ROTULOS_STATUS, TRANSICOES_STATUS_PEDIDO } from "@/lib/filtrosPedido";

type Props = {
  pedido: Pedido;
  atualizando: boolean;
  bloqueado: boolean;
  arrastando: boolean;
  recebimentoAtualizando: boolean;
  onRecebimento: (id: number, status: StatusRecebimento) => void;
  onDragStart: (id: number, event: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
};

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const estilosStatus: Record<Pedido["status"], string> = {
  Pendente: "bg-amber-100 text-amber-800",
  EmPreparo: "bg-orange-100 text-orange-800",
  SaiuParaEntrega: "bg-blue-100 text-blue-800",
  Entregue: "bg-green-100 text-green-800",
  Cancelado: "bg-gray-200 text-gray-700",
};

const estilosRecebimento: Record<StatusRecebimento, string> = {
  Pendente: "bg-amber-100 text-amber-800",
  Pago: "bg-green-100 text-green-800",
  Falhou: "bg-red-100 text-red-800",
};

function formatarTempoEspera(minutosTotais: number) {
  const horas = Math.floor(minutosTotais / 60);
  const minutos = minutosTotais % 60;
  return `${horas} ${horas === 1 ? "hora" : "horas"} e ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
}

export function PedidoKanbanCard({ pedido, atualizando, bloqueado, arrastando, recebimentoAtualizando, onRecebimento, onDragStart, onDragEnd }: Props) {
  const [agora, setAgora] = useState(() => Date.now());
  const proximosStatus = TRANSICOES_STATUS_PEDIDO[pedido.status];
  const minutosAguardando = minutosAguardandoPedido(pedido.criadoEm, new Date(agora));
  const pendenteAntigo = pedidoPendenteAntigo(pedido.status, pedido.criadoEm, new Date(agora));
  const recebimento = pedido.recebimento?.status;

  useEffect(() => {
    if (pedido.status !== "Pendente") return;
    const intervalo = window.setInterval(() => setAgora(Date.now()), 30_000);
    return () => window.clearInterval(intervalo);
  }, [pedido.status]);

  return (
    <article
      draggable={!bloqueado && proximosStatus.length > 0}
      onDragStart={(event) => onDragStart(pedido.id, event)}
      onDragEnd={onDragEnd}
      aria-busy={atualizando}
      className={`min-w-0 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition duration-200 ${arrastando ? "scale-[0.98] border-red-500 opacity-50 shadow-lg" : pendenteAntigo ? "border-amber-300 shadow-amber-100" : "border-gray-200 hover:shadow-md"} ${!bloqueado && proximosStatus.length > 0 ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <header className="flex min-w-0 items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600" aria-hidden="true">
            <FileText size={21} strokeWidth={2.1} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-extrabold text-slate-900">Pedido #{pedido.id}</h3>
            <time className="block text-[11px] leading-4 text-slate-500" dateTime={pedido.criadoEm}>
              {new Date(pedido.criadoEm).toLocaleString("pt-BR", { timeZone: FUSO_HORARIO_PEDIDOS, dateStyle: "short", timeStyle: "short" })}
            </time>
          </div>
        </div>
        <span className={`max-w-[7.5rem] shrink-0 rounded-full px-2.5 py-1 text-center text-[11px] font-bold leading-4 ${estilosStatus[pedido.status]}`}>
          {ROTULOS_STATUS[pedido.status]}
        </span>
      </header>

      {pedido.status === "Pendente" && (
        <div className={`mt-3 flex gap-2 rounded-xl border px-3 py-2.5 ${pendenteAntigo ? "border-amber-300 bg-amber-100 text-amber-900" : "border-amber-200 bg-amber-50 text-amber-800"}`} role="status">
          <Clock3 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-extrabold leading-4">Aguardando há {formatarTempoEspera(minutosAguardando)}</p>
            <p className="mt-0.5 text-[11px] font-medium opacity-80">Aguardando atendimento.</p>
          </div>
        </div>
      )}

      <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5" aria-label="Cliente">
        <div className="flex min-w-0 items-start gap-2.5">
          <UserRound className="mt-0.5 shrink-0 text-slate-500" size={19} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-500">Cliente</p>
            <p className="truncate text-sm font-bold text-slate-900">{pedido.nomeCliente ?? "Cliente convidado"}</p>
            {pedido.telefone && <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600"><Phone size={13} aria-hidden="true" /><span>{formatarTelefone(pedido.telefone)}</span></p>}
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5" aria-label="Itens do pedido">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><UtensilsCrossed size={17} aria-hidden="true" /><span>Itens do pedido</span></div>
        <ul className="mt-2.5 space-y-2 pl-6 text-xs text-slate-700">
          {pedido.itens.map((item) => (
            <li key={item.id} className="flex min-w-0 gap-1.5 leading-4">
              <span className="shrink-0 font-extrabold text-slate-900">{item.quantidade}×</span>
              <span className="min-w-0 break-words font-semibold">{item.nomeProduto} <span className="font-normal text-slate-500">({item.tamanho})</span></span>
            </li>
          ))}
        </ul>
      </section>

      <dl className="grid grid-cols-2 gap-2 py-3 text-xs">
        <div className="min-w-0 rounded-xl border border-red-100 bg-red-50/60 p-3">
          <dt className="flex items-center gap-1.5 text-[11px] text-slate-500"><WalletCards size={14} aria-hidden="true" />Total</dt>
          <dd className="mt-1 truncate font-extrabold text-slate-900">{moeda.format(pedido.valorTotal)}</dd>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <dt className="flex items-center gap-1.5 text-[11px] text-slate-500">{pedido.metodoEntrega === "Retirada" ? <Store size={14} aria-hidden="true" /> : <Truck size={14} aria-hidden="true" />}Atendimento</dt>
          <dd className="mt-1 truncate font-bold text-slate-900">{pedido.metodoEntrega === "Retirada" ? "Retirada" : "Entrega"}</dd>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <dt className="flex items-center gap-1.5 text-[11px] text-slate-500"><CreditCard size={14} aria-hidden="true" />Pagamento</dt>
          <dd className="mt-1 truncate font-bold text-slate-900">{pedido.recebimento?.formaPagamento ?? "Não registrado"}</dd>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <dt className="flex items-center gap-1.5 text-[11px] text-slate-500"><ReceiptText size={14} aria-hidden="true" />Recebimento</dt>
          <dd className="mt-1">{recebimento ? <span className={`inline-block max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-extrabold ${estilosRecebimento[recebimento]}`}>{recebimento}</span> : <span className="text-[11px] font-semibold text-slate-600">Não registrado</span>}</dd>
        </div>
      </dl>

      {atualizando && <p className="mb-3 rounded-lg bg-amber-50 p-2 text-center text-xs font-semibold text-amber-900" role="status">Atualizando status...</p>}

      <details className="group rounded-xl border border-red-100 bg-red-50/40 px-3.5 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold text-red-700 [&::-webkit-details-marker]:hidden">
          <span>Visualizar detalhes</span>
          <ChevronDown className="shrink-0 transition-transform group-open:rotate-180" size={18} aria-hidden="true" />
        </summary>
        <div className="mt-3 border-t border-red-100 pt-3">
          <PedidoCard pedido={pedido} modoKanban>
            {pedido.recebimento && (
              <label className="block border-t border-slate-200 pt-4 text-sm font-bold text-slate-700" htmlFor={`recebimento-${pedido.id}`}>
                Status do recebimento
                <select
                  id={`recebimento-${pedido.id}`}
                  value={pedido.recebimento.status}
                  disabled={recebimentoAtualizando}
                  onChange={(event) => onRecebimento(pedido.id, event.target.value as StatusRecebimento)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal text-slate-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:opacity-50"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                  <option value="Falhou">Falhou</option>
                </select>
              </label>
            )}
          </PedidoCard>
        </div>
      </details>
    </article>
  );
}
