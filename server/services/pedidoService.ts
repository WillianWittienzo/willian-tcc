import { NomeBorda as NomeBordaBanco, NomeTamanho, StatusPedido } from "@/app/generated/prisma/client";
import { aplicarDesconto, buscarBorda, TAMANHOS, type NomeBorda } from "@/lib/catalogo";
import { calcularTaxaEntregaEmCentavos } from "@/lib/pedido";
import { calcularTotalPaginas, normalizarFiltrosPedidos, obterIntervaloPeriodo } from "@/lib/filtrosPedido";
import { pedidoRepository } from "@/server/repositories/pedidoRepository";

type TamanhoPedido = (typeof TAMANHOS)[number];
type ItemRecebido = { produtoId: number; tamanho: TamanhoPedido; borda: NomeBorda; quantidade: number };

export class PedidoInvalidoError extends Error {}
export class PedidoNaoEncontradoError extends Error {}

type PedidoPersistido = Awaited<ReturnType<typeof pedidoRepository.criar>>;

function formatarPedido(pedido: PedidoPersistido) {
  return {
    id: pedido.id,
    clienteId: pedido.clienteId,
    valorTotal: Number(pedido.valorTotal),
    taxaEntrega: Number(pedido.taxaEntrega),
    status: pedido.status,
    criadoEm: pedido.criadoEm,
    itens: pedido.itens.map((item) => ({
      id: item.id,
      produtoId: item.produtoId,
      nomeProduto: item.nomeProduto,
      tamanho: item.tamanho === "Media" ? "Média" : item.tamanho,
      borda: item.borda,
      precoBorda: Number(item.precoBorda),
      quantidade: item.quantidade,
      precoUnitario: Number(item.precoUnitario),
    })),
  };
}

function validarItens(data: unknown): ItemRecebido[] {
  if (typeof data !== "object" || data === null || !("itens" in data) || !Array.isArray(data.itens) || data.itens.length === 0 || data.itens.length > 50) {
    throw new PedidoInvalidoError("O pedido deve possuir de 1 a 50 itens");
  }

  return data.itens.map((item) => {
    if (typeof item !== "object" || item === null) throw new PedidoInvalidoError("Item do pedido inválido");
    const produtoId = "produtoId" in item ? item.produtoId : null;
    const quantidade = "quantidade" in item ? item.quantidade : null;
    const tamanho = "tamanho" in item ? item.tamanho : null;
    const borda = buscarBorda("borda" in item ? item.borda : null);
    if (!Number.isInteger(produtoId) || Number(produtoId) <= 0 || !Number.isInteger(quantidade) || Number(quantidade) <= 0 || Number(quantidade) > 99 || !TAMANHOS.includes(tamanho as TamanhoPedido) || !borda) {
      throw new PedidoInvalidoError("Produto, tamanho, borda ou quantidade inválidos");
    }
    return {
      produtoId: Number(produtoId),
      tamanho: tamanho as TamanhoPedido,
      borda: borda.nome,
      quantidade: Number(quantidade),
    };
  });
}

function converterTamanho(tamanho: TamanhoPedido) {
  return tamanho === "Média" ? NomeTamanho.Media : NomeTamanho[tamanho];
}

function obterStatus(data: unknown) {
  if (typeof data !== "object" || data === null || !("status" in data) || typeof data.status !== "string" || !Object.values(StatusPedido).includes(data.status as StatusPedido)) {
    throw new PedidoInvalidoError("Status do pedido inválido");
  }
  return data.status as StatusPedido;
}

function registroNaoEncontrado(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2025";
}

export const pedidoService = {
  async listarTodos(parametros: Record<string, unknown>) {
    const filtros = normalizarFiltrosPedidos(parametros);
    const { pedidos, total } = await pedidoRepository.listarTodos({
      status: filtros.status === "Todos" ? undefined : StatusPedido[filtros.status],
      intervalo: obterIntervaloPeriodo(filtros.periodo),
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
    });
    return {
      pedidos: pedidos.map(formatarPedido),
      total,
      totalPages: calcularTotalPaginas(total, filtros.limit),
      currentPage: filtros.page,
      limit: filtros.limit,
    };
  },
  async listarDoCliente(clienteId: number) {
    return (await pedidoRepository.listarDoCliente(clienteId)).map(formatarPedido);
  },
  async criar(clienteId: number, data: unknown) {
    const itensRecebidos = validarItens(data);
    const produtoIds = [...new Set(itensRecebidos.map((item) => item.produtoId))];
    const produtos = await pedidoRepository.buscarProdutosComTamanhos(produtoIds);
    const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
    let subtotalEmCentavos = 0;

    const itens = itensRecebidos.map((item) => {
      const produto = produtosPorId.get(item.produtoId);
      if (!produto) throw new PedidoInvalidoError(`Produto ${item.produtoId} não encontrado`);
      const tamanho = converterTamanho(item.tamanho);
      const produtoTamanho = produto.tamanhos.find((opcao) => opcao.nome === tamanho);
      if (!produtoTamanho) throw new PedidoInvalidoError(`Tamanho ${item.tamanho} indisponível para ${produto.nome}`);

      const borda = buscarBorda(item.borda)!;
      const precoPizza = aplicarDesconto(Number(produtoTamanho.preco), produto.descontoPercentual);
      const precoPizzaEmCentavos = Math.round(precoPizza * 100);
      const precoBordaEmCentavos = Math.round(borda.preco * 100);
      subtotalEmCentavos += (precoPizzaEmCentavos + precoBordaEmCentavos) * item.quantidade;

      return {
        produtoId: produto.id,
        nomeProduto: produto.nome,
        tamanho,
        borda: borda.nome === "Sem borda" ? null : NomeBordaBanco[borda.nome],
        precoBorda: borda.preco,
        quantidade: item.quantidade,
        precoUnitario: precoPizzaEmCentavos / 100,
      };
    });

    const taxaEntregaEmCentavos = calcularTaxaEntregaEmCentavos(subtotalEmCentavos);
    return formatarPedido(await pedidoRepository.criar({
      clienteId,
      taxaEntrega: taxaEntregaEmCentavos / 100,
      valorTotal: (subtotalEmCentavos + taxaEntregaEmCentavos) / 100,
      itens,
    }));
  },
  async atualizarStatus(id: number, data: unknown) {
    if (!Number.isInteger(id) || id <= 0) throw new PedidoInvalidoError("ID do pedido inválido");
    const status = obterStatus(data);
    try {
      return formatarPedido(await pedidoRepository.atualizarStatus(id, status));
    } catch (error) {
      if (registroNaoEncontrado(error)) throw new PedidoNaoEncontradoError("Pedido não encontrado");
      throw error;
    }
  },
};
