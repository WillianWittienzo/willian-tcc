export type ResumoDashboard = {
  totalPedidos: number;
  receita: number;
  clientes: number;
  produtos: number;
};

export async function obterResumoDashboard(periodo: PeriodoPedido): Promise<ResumoDashboard> {
  const parametros = new URLSearchParams({ periodo });
  const response = await fetch(`/api/admin/dashboard?${parametros}`);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.erro ?? "Erro ao carregar dashboard");
  return data;
}
import type { PeriodoPedido } from "@/lib/filtrosPedido";
