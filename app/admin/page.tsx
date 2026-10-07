"use client";

import { useEffect, useState } from "react";
import CardDashboard from "@/components/adm/CardDashboard";
import { obterResumoDashboard, type ResumoDashboard } from "@/client/dashboardClient";
import { PERIODOS_PEDIDO, ROTULOS_PERIODO, type PeriodoPedido } from "@/lib/filtrosPedido";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function DashboardPage() {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [erro, setErro] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoPedido>("Todos");

  useEffect(() => {
    let ativo = true;
    obterResumoDashboard(periodo)
      .then((dados) => {
        if (ativo) {
          setResumo(dados);
          setErro("");
        }
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof Error ? error.message : "Erro ao carregar dashboard");
      });
    return () => { ativo = false; };
  }, [periodo]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold">DASHBOARD</h2>
        <label className="text-sm font-semibold">
          Período
          <select
            value={periodo}
            onChange={(event) => {
              setResumo(null);
              setErro("");
              setPeriodo(event.target.value as PeriodoPedido);
            }}
            className="ml-2 rounded-md border bg-white px-3 py-2 font-normal"
          >
            {PERIODOS_PEDIDO.map((opcao) => (
              <option key={opcao} value={opcao}>{ROTULOS_PERIODO[opcao]}</option>
            ))}
          </select>
        </label>
      </div>
      {erro && <p className="mb-4 rounded bg-red-100 p-3 text-red-800">{erro}</p>}
      {!resumo && !erro && <p className="text-gray-500">Carregando...</p>}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardDashboard title="Total de Pedidos" value={String(resumo.totalPedidos)} />
          <CardDashboard title="Receita Total" value={moeda.format(resumo.receita)} />
          <CardDashboard title="Clientes" value={String(resumo.clientes)} />
          <CardDashboard title="Produtos cadastrados" value={String(resumo.produtos)} />
        </div>
      )}
    </div>
  );
}
