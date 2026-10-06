"use client";

import { useEffect, useState } from "react";
import CardDashboard from "@/components/adm/CardDashboard";
import { obterResumoDashboard, type ResumoDashboard } from "@/client/dashboardClient";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function DashboardPage() {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    obterResumoDashboard().then(setResumo).catch((error) => setErro(error instanceof Error ? error.message : "Erro ao carregar dashboard"));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">DASHBOARD</h2>
      {erro && <p className="mb-4 rounded bg-red-100 p-3 text-red-800">{erro}</p>}
      {!resumo && !erro && <p className="text-gray-500">Carregando...</p>}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardDashboard title="Total de Pedidos" value={String(resumo.totalPedidos)} />
          <CardDashboard title="Receita Total" value={moeda.format(resumo.receita)} />
          <CardDashboard title="Clientes" value={String(resumo.clientes)} />
          <CardDashboard title="Produtos" value={String(resumo.produtos)} />
        </div>
      )}
    </div>
  );
}
