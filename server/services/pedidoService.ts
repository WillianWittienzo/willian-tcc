import {
  FormaPagamento,
  MetodoEntrega,
  NomeBorda as NomeBordaBanco,
  NomeTamanho,
  StatusPedido,
  StatusRecebimento,
} from "@/app/generated/prisma/client";
import { aplicarDesconto, buscarBorda, TAMANHOS, type NomeBorda } from "@/lib/catalogo";
import {
  DadosEntregaInvalidosError,
  normalizarDadosCheckout,
  normalizarTelefone,
} from "@/lib/checkout";
import { calcularTaxaEntregaEmCentavos } from "@/lib/pedido";
import {
  calcularAnosDisponiveis,
  calcularTotalPaginas,
  normalizarFiltrosPedidos,
  obterIntervaloData,
} from "@/lib/filtrosPedido";
import { pedidoRepository } from "@/server/repositories/pedidoRepository";

type TamanhoPedido = (typeof TAMANHOS)[number];
type ItemRecebido = { produtoId: number; tamanho: TamanhoPedido; borda: NomeBorda; quantidade: number };

export class PedidoInvalidoError extends Error {}
export class PedidoNaoEncontradoError extends Error {}

type PedidoPersistido = NonNullable<Awaited<ReturnType<typeof pedidoRepository.buscarPublico>>>;

function formatarFormaPagamento(forma: FormaPagamento) {
  return forma === FormaPagamento.Cartao ? "Cartão" : forma;
}

function formatarPedido(pedido: PedidoPersistido) {
  return {
    id: pedido.id,
    clienteId: pedido.clienteId,
    nomeCliente: pedido.nomeCliente,
    telefone: pedido.telefone,
    cep: pedido.cep,
    rua: pedido.rua,
    numero: pedido.numero,
    bairro: pedido.bairro,
    complemento: pedido.complemento,
    referencia: pedido.referencia,
    metodoEntrega: pedido.metodoEntrega,
    valorTotal: Number(pedido.valorTotal),
    taxaEntrega: Number(pedido.taxaEntrega),
    status: pedido.status,
    criadoEm: pedido.criadoEm,
    recebimento: pedido.recebimento ? {
      id: pedido.recebimento.id,
      valor: Number(pedido.recebimento.valor),
      formaPagamento: formatarFormaPagamento(pedido.recebimento.formaPagamento),
      status: pedido.recebimento.status,
      criadoEm: pedido.recebimento.criadoEm,
      atualizadoEm: pedido.recebimento.atualizadoEm,
    } : null,
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

function formatarPedidoPublico(pedido: PedidoPersistido) {
  const formatado = formatarPedido(pedido);
  return {
    id: formatado.id,
    criadoEm: formatado.criadoEm,
    metodoEntrega: formatado.metodoEntrega,
    valorTotal: formatado.valorTotal,
    taxaEntrega: formatado.taxaEntrega,
    status: formatado.status,
    recebimento: formatado.recebimento && {
      valor: formatado.recebimento.valor,
      formaPagamento: formatado.recebimento.formaPagamento,
      status: formatado.recebimento.status,
    },
    itens: formatado.itens,
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

function converterFormaPagamento(forma: string) {
  return forma === "Cartão" ? FormaPagamento.Cartao : FormaPagamento[forma as keyof typeof FormaPagamento];
}

function obterStatus(data: unknown) {
  if (typeof data !== "object" || data === null || !("status" in data) || typeof data.status !== "string" || !Object.values(StatusPedido).includes(data.status as StatusPedido)) {
    throw new PedidoInvalidoError("Status do pedido inválido");
  }
  return data.status as StatusPedido;
}

function obterStatusRecebimento(data: unknown) {
  if (typeof data !== "object" || data === null || !("status" in data) || typeof data.status !== "string" || !Object.values(StatusRecebimento).includes(data.status as StatusRecebimento)) {
    throw new PedidoInvalidoError("Status do recebimento inválido");
  }
  return data.status as StatusRecebimento;
}

function registroNaoEncontrado(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2025";
}

export const pedidoService = {
  async listarTodos(parametros: Record<string, unknown>) {
    const filtros = normalizarFiltrosPedidos(parametros);
    const { pedidos, total, pedidoMaisAntigo } = await pedidoRepository.listarTodos({
      status: filtros.status === "Todos" ? undefined : StatusPedido[filtros.status],
      intervalo: obterIntervaloData(filtros),
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
    });
    return {
      pedidos: pedidos.map(formatarPedido),
      total,
      totalPages: calcularTotalPaginas(total, filtros.limit),
      currentPage: filtros.page,
      limit: filtros.limit,
      anosDisponiveis: calcularAnosDisponiveis(pedidoMaisAntigo?.criadoEm ?? null),
    };
  },

  async listarDoCliente(clienteId: number) {
    return (await pedidoRepository.listarDoCliente(clienteId)).map(formatarPedido);
  },

  async criar(data: unknown) {
    const itensRecebidos = validarItens(data);
    let checkout;
    try {
      checkout = normalizarDadosCheckout(
        typeof data === "object" && data !== null && "dadosCheckout" in data
          ? data.dadosCheckout
          : null,
      );
    } catch (error) {
      if (error instanceof DadosEntregaInvalidosError) throw new PedidoInvalidoError(error.message);
      throw error;
    }

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

    const taxaEntregaEmCentavos = calcularTaxaEntregaEmCentavos(subtotalEmCentavos, checkout.metodoEntrega);
    const valorTotal = (subtotalEmCentavos + taxaEntregaEmCentavos) / 100;
    return formatarPedido(await pedidoRepository.criar({
      clienteId: null,
      nomeCliente: checkout.nomeCliente,
      telefone: checkout.telefone,
      cep: checkout.cep,
      rua: checkout.rua,
      numero: checkout.numero,
      bairro: checkout.bairro,
      complemento: checkout.complemento,
      referencia: checkout.referencia,
      metodoEntrega: MetodoEntrega[checkout.metodoEntrega],
      formaPagamento: converterFormaPagamento(checkout.formaPagamento),
      taxaEntrega: taxaEntregaEmCentavos / 100,
      valorTotal,
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

  async atualizarStatusRecebimento(id: number, data: unknown) {
    if (!Number.isInteger(id) || id <= 0) throw new PedidoInvalidoError("ID do pedido inválido");
    const status = obterStatusRecebimento(data);
    try {
      const recebimento = await pedidoRepository.atualizarStatusRecebimento(id, status);
      return {
        valor: Number(recebimento.valor),
        formaPagamento: formatarFormaPagamento(recebimento.formaPagamento),
        status: recebimento.status,
      };
    } catch (error) {
      if (registroNaoEncontrado(error)) throw new PedidoNaoEncontradoError("Recebimento não encontrado");
      throw error;
    }
  },

  async acompanhar(data: unknown) {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new PedidoNaoEncontradoError("Pedido não encontrado com os dados informados.");
    }
    const recebido = data as Record<string, unknown>;
    const idBruto = recebido.pedidoId;
    if ((typeof idBruto !== "string" && typeof idBruto !== "number") || String(idBruto).length > 10) {
      throw new PedidoNaoEncontradoError("Pedido não encontrado com os dados informados.");
    }
    const id = Number(idBruto);
    let telefone: string;
    try {
      telefone = normalizarTelefone(recebido.telefone);
    } catch {
      throw new PedidoNaoEncontradoError("Pedido não encontrado com os dados informados.");
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new PedidoNaoEncontradoError("Pedido não encontrado com os dados informados.");
    }
    const pedido = await pedidoRepository.buscarPublico(id, telefone);
    if (!pedido) throw new PedidoNaoEncontradoError("Pedido não encontrado com os dados informados.");
    return formatarPedidoPublico(pedido);
  },
};
