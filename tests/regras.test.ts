import assert from "node:assert/strict";
import test from "node:test";
import { itensTemMesmaConfiguracao } from "../lib/carrinho";
import { aplicarDesconto, buscarBorda } from "../lib/catalogo";
import { calcularTaxaEntregaEmCentavos } from "../lib/pedido";
import {
  PERIODOS_PEDIDO,
  STATUS_FILTRO_PEDIDO,
  STATUS_EXCLUIDO_RECEITA,
  ParametrosFiltroInvalidosError,
  calcularTotalPaginas,
  normalizarFiltrosPedidos,
  normalizarPeriodo,
  obterIntervaloPeriodo,
} from "../lib/filtrosPedido";

test("cobra entrega para subtotal de R$ 79,99", () => {
  assert.equal(calcularTaxaEntregaEmCentavos(7999), 800);
});

test("oferece entrega grátis a partir de R$ 80,00", () => {
  assert.equal(calcularTaxaEntregaEmCentavos(8000), 0);
  assert.equal(calcularTaxaEntregaEmCentavos(10000), 0);
});

test("calcula promoção com arredondamento em centavos", () => {
  assert.equal(aplicarDesconto(42.9, 10), 38.61);
  assert.equal(aplicarDesconto(42.9, null), 42.9);
});

test("aceita sem borda sem acréscimo e mantém os recheios a R$ 5,00", () => {
  assert.deepEqual(buscarBorda("Sem borda"), { nome: "Sem borda", preco: 0 });
  assert.deepEqual(buscarBorda("Catupiry"), { nome: "Catupiry", preco: 5 });
  assert.deepEqual(buscarBorda("Cheddar"), { nome: "Cheddar", preco: 5 });
  assert.equal(buscarBorda("Outra"), undefined);
});

test("diferencia itens do carrinho pela borda", () => {
  const semBorda = { id: 1, tamanho: "Média", borda: "Sem borda" } as const;

  assert.equal(itensTemMesmaConfiguracao(semBorda, { ...semBorda }), true);
  assert.equal(
    itensTemMesmaConfiguracao(semBorda, { ...semBorda, borda: "Catupiry" }),
    false,
  );
  assert.equal(
    itensTemMesmaConfiguracao(
      { ...semBorda, borda: "Catupiry" },
      { ...semBorda, borda: "Cheddar" },
    ),
    false,
  );
});

test("aceita todos os filtros de status com os períodos disponíveis", () => {
  for (const status of STATUS_FILTRO_PEDIDO) {
    for (const periodo of PERIODOS_PEDIDO) {
      assert.deepEqual(
        normalizarFiltrosPedidos({ status, periodo, page: "2", limit: "10" }),
        { status, periodo, page: 2, limit: 10 },
      );
    }
  }
});

test("usa Todos, primeira página e dez itens como padrões", () => {
  assert.deepEqual(normalizarFiltrosPedidos({}), {
    status: "Todos",
    periodo: "Todos",
    page: 1,
    limit: 10,
  });
});

test("rejeita status, período e paginação inválidos", () => {
  const invalidos = [
    { status: "Excluido" },
    { periodo: "Semana" },
    { page: "0" },
    { page: "-1" },
    { page: "abc" },
    { limit: "0" },
    { limit: "51" },
  ];

  for (const parametros of invalidos) {
    assert.throws(
      () => normalizarFiltrosPedidos(parametros),
      ParametrosFiltroInvalidosError,
    );
  }
});

test("calcula primeira e última página em blocos de dez", () => {
  assert.equal(calcularTotalPaginas(0, 10), 1);
  assert.equal(calcularTotalPaginas(1, 10), 1);
  assert.equal(calcularTotalPaginas(10, 10), 1);
  assert.equal(calcularTotalPaginas(11, 10), 2);
  assert.equal(calcularTotalPaginas(95, 10), 10);
});

test("mantém pedidos cancelados fora da receita do dashboard", () => {
  assert.equal(STATUS_EXCLUIDO_RECEITA, "Cancelado");
});

test("calcula início e fim dos períodos no fuso de São Paulo", () => {
  const agora = new Date("2026-10-07T15:30:00.000Z");

  assert.deepEqual(obterIntervaloPeriodo(normalizarPeriodo("Hoje"), agora), {
    gte: new Date("2026-10-07T03:00:00.000Z"),
    lt: new Date("2026-10-08T03:00:00.000Z"),
  });
  assert.deepEqual(obterIntervaloPeriodo(normalizarPeriodo("EsteMes"), agora), {
    gte: new Date("2026-10-01T03:00:00.000Z"),
    lt: new Date("2026-11-01T03:00:00.000Z"),
  });
  assert.deepEqual(obterIntervaloPeriodo(normalizarPeriodo("EsteAno"), agora), {
    gte: new Date("2026-01-01T03:00:00.000Z"),
    lt: new Date("2027-01-01T03:00:00.000Z"),
  });
  assert.equal(obterIntervaloPeriodo(normalizarPeriodo("Todos"), agora), undefined);
});
