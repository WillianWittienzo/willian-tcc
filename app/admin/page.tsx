"use client";

import { useEffect, useState } from "react";
import CardDashboard from "@/components/adm/CardDashboard";
import { FiltrosData } from "@/components/adm/FiltrosData";
import { obterResumoDashboard, type ResumoDashboard } from "@/client/dashboardClient";
import type { FiltrosDataPedido } from "@/lib/filtrosPedido";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function DashboardPage() {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [erro, setErro] = useState("");
  const [filtrosData, setFiltrosData] = useState<FiltrosDataPedido>({ dia: null, mes: null, ano: null });
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);

  useEffect(() => {
    let ativo = true;
    obterResumoDashboard(filtrosData)
      .then((dados) => {
        if (ativo) {
          setResumo(dados);
          setAnosDisponiveis(dados.anosDisponiveis);
          setErro("");
        }
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof Error ? error.message : "Erro ao carregar dashboard");
      });
    return () => { ativo = false; };
  }, [filtrosData]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold">DASHBOARD</h2>
        <FiltrosData
          filtros={filtrosData}
          anosDisponiveis={anosDisponiveis}
          onChange={(novosFiltros) => {
            setResumo(null);
            setErro("");
            setFiltrosData(novosFiltros);
          }}
        />
      </div>
      {erro && <p className="mb-4 rounded bg-red-100 p-3 text-red-800">{erro}</p>}
      {!resumo && !erro && <p className="text-gray-500">Carregando...</p>}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CardDashboard title="Total de Pedidos" value={String(resumo.totalPedidos)} />
          <CardDashboard title="Receita Total" value={moeda.format(resumo.receita)} />
          <CardDashboard title="Clientes" value={String(resumo.clientes)} />
          <CardDashboard title="Produtos cadastrados" value={String(resumo.produtos)} />
          <CardDashboard title="Recebimentos pendentes" value={String(resumo.recebimentosPendentes)} />
          <CardDashboard title="Valor recebido" value={moeda.format(resumo.valorRecebido)} />
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500">Receita considera pedidos não cancelados; valor recebido considera somente recebimentos marcados como Pago.</p>
    </div>
  );
}
