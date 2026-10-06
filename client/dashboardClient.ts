export type ResumoDashboard = {
  totalPedidos: number;
  receita: number;
  clientes: number;
  produtos: number;
};

export async function obterResumoDashboard(): Promise<ResumoDashboard> {
  const response = await fetch("/api/admin/dashboard");
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.erro ?? "Erro ao carregar dashboard");
  return data;
}
