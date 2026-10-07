import type { NomeBorda, NomeBordaRecheada, TamanhoProduto } from "@/lib/catalogo";
import type { DadosEntrega } from "@/lib/checkout";
import {
  STATUS_PEDIDO,
  type FiltrosDataPedido,
  type StatusFiltroPedido,
  type StatusPedido,
} from "@/lib/filtrosPedido";

export { STATUS_PEDIDO };
export type { StatusPedido };

export type CriarPedidoData = {
  dadosEntrega: DadosEntrega;
  itens: {
    produtoId: number;
    tamanho: TamanhoProduto;
    borda: NomeBorda;
    quantidade: number;
  }[];
};

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
  nomeCliente: string | null;
  telefone: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  referencia: string | null;
  valorTotal: number;
  taxaEntrega: number;
  status: StatusPedido;
  criadoEm: string;
  itens: ItemPedido[];
};

export type PaginaPedidos = {
  pedidos: Pedido[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  anosDisponiveis: number[];
};

export type FiltrosPedidos = FiltrosDataPedido & {
  status: StatusFiltroPedido;
  page: number;
  limit?: number;
};

export async function listarPedidos(filtros: FiltrosPedidos): Promise<PaginaPedidos> {
  const parametros = new URLSearchParams({
    status: filtros.status,
    page: String(filtros.page),
    limit: String(filtros.limit ?? 10),
  });
  if (filtros.dia !== null) parametros.set("dia", String(filtros.dia));
  if (filtros.mes !== null) parametros.set("mes", String(filtros.mes));
  if (filtros.ano !== null) parametros.set("ano", String(filtros.ano));
  const response = await fetch(`/api/pedidos?${parametros}`);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.erro ?? "Erro ao buscar pedidos");
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
