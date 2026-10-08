import type { FiltrosDataPedido } from "@/lib/filtrosPedido";

export type ResumoDashboard = {
  totalPedidos: number;
  receita: number;
  clientes: number;
  produtos: number;
  recebimentosPendentes: number;
  valorRecebido: number;
  anosDisponiveis: number[];
};

export async function obterResumoDashboard(filtros: FiltrosDataPedido): Promise<ResumoDashboard> {
  const parametros = new URLSearchParams();
  if (filtros.dia !== null) parametros.set("dia", String(filtros.dia));
  if (filtros.mes !== null) parametros.set("mes", String(filtros.mes));
  if (filtros.ano !== null) parametros.set("ano", String(filtros.ano));
  const response = await fetch(`/api/admin/dashboard?${parametros}`);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.erro ?? "Erro ao carregar dashboard");
  return data;
}
