import type { SituacaoFuncionamento } from "@/lib/funcionamento";

async function lerResposta(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.erro ?? fallback);
  return data as SituacaoFuncionamento;
}

export async function consultarFuncionamento(): Promise<SituacaoFuncionamento> {
  return lerResposta(await fetch("/api/funcionamento", { cache: "no-store" }), "Erro ao consultar funcionamento");
}

export async function atualizarFuncionamento(
  data: Pick<SituacaoFuncionamento, "fechamentoManual" | "horarios">,
): Promise<SituacaoFuncionamento> {
  return lerResposta(await fetch("/api/funcionamento", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "Erro ao salvar funcionamento");
}
