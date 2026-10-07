import type { NomeBorda, NomeBordaRecheada, TamanhoProduto } from "@/lib/catalogo";

export type CriarPedidoData = {
  itens: {
    produtoId: number;
    tamanho: TamanhoProduto;
    borda: NomeBorda;
    quantidade: number;
  }[];
};

export const STATUS_PEDIDO = [
  "Pendente",
  "EmPreparo",
  "SaiuParaEntrega",
  "Entregue",
  "Cancelado",
] as const;

export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export type ItemPedido = {
  id: number;
  produtoId: number | null;
  nomeProduto: string;
  tamanho: TamanhoProduto;
  borda: NomeBordaRecheada | null;
  precoBorda: number;
  quantidade: number;
  precoUnitario: number;
};

export type Pedido = {
  id: number;
  clienteId: number | null;
  valorTotal: number;
  taxaEntrega: number;
  status: StatusPedido;
  criadoEm: string;
  itens: ItemPedido[];
};

export async function listarPedidos(): Promise<Pedido[]> {
  const response = await fetch("/api/pedidos");

  if (!response.ok) {
    throw new Error("Erro ao buscar pedidos");
  }

  return response.json();
}

export async function listarMeusPedidos(): Promise<Pedido[]> {
  const response = await fetch("/api/pedidos/meus");

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.erro ?? "Erro ao buscar seus pedidos");
  }

  return response.json();
}

export async function criarPedido(
  data: CriarPedidoData
): Promise<Pedido> {
  const response = await fetch("/api/pedidos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const resposta = await response.json().catch(() => null);
    throw new Error(resposta?.erro ?? "Erro ao finalizar pedido");
  }

  return response.json();
}

export async function atualizarStatusPedido(
  id: number,
  status: StatusPedido
): Promise<Pedido> {
  const response = await fetch(`/api/pedidos/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const resposta = await response.json().catch(() => null);
    throw new Error(resposta?.erro ?? "Erro ao atualizar status do pedido");
  }

  return response.json();
}
