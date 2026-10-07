import assert from "node:assert/strict";
import test from "node:test";
import { itensTemMesmaConfiguracao } from "../lib/carrinho";
import { aplicarDesconto, buscarBorda } from "../lib/catalogo";
import { DadosEntregaInvalidosError, normalizarDadosEntrega } from "../lib/checkout";
import { calcularTaxaEntregaEmCentavos } from "../lib/pedido";
import {
  STATUS_FILTRO_PEDIDO,
  STATUS_EXCLUIDO_RECEITA,
  ParametrosFiltroInvalidosError,
  calcularAnosDisponiveis,
  calcularTotalPaginas,
  normalizarFiltrosData,
  normalizarFiltrosPedidos,
  obterIntervaloData,
} from "../lib/filtrosPedido";
import { registrarTentativaPedido, verificarLimitePedido } from "../server/auth/limitePedido";

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

test("aceita todos os filtros de status combinados com dia, mês e ano", () => {
  const datas = [
    { parametros: {}, esperado: { dia: null, mes: null, ano: null } },
    { parametros: { ano: "2026" }, esperado: { dia: null, mes: null, ano: 2026 } },
    { parametros: { mes: "10", ano: "2026" }, esperado: { dia: null, mes: 10, ano: 2026 } },
    { parametros: { dia: "7", mes: "10", ano: "2026" }, esperado: { dia: 7, mes: 10, ano: 2026 } },
  ];
  for (const status of STATUS_FILTRO_PEDIDO) {
    for (const data of datas) {
      assert.deepEqual(
        normalizarFiltrosPedidos({ status, ...data.parametros, page: "2", limit: "10" }),
        { status, ...data.esperado, page: 2, limit: 10 },
      );
    }
  }
});

test("usa Todos, primeira página e dez itens como padrões", () => {
  assert.deepEqual(normalizarFiltrosPedidos({}), {
    status: "Todos",
    dia: null,
    mes: null,
    ano: null,
    page: 1,
    limit: 10,
  });
});

test("rejeita status, data e paginação inválidos", () => {
  const invalidos = [
    { status: "Excluido" },
    { dia: "0", mes: "10", ano: "2026" },
    { dia: "32", mes: "10", ano: "2026" },
    { mes: "13", ano: "2026" },
    { ano: "1999" },
    { dia: "7" },
    { mes: "10" },
    { dia: "31", mes: "2", ano: "2026" },
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

test("calcula início e fim dos filtros no fuso de São Paulo", () => {
  assert.deepEqual(obterIntervaloData({ dia: 7, mes: 10, ano: 2026 }), {
    gte: new Date("2026-10-07T03:00:00.000Z"),
    lt: new Date("2026-10-08T03:00:00.000Z"),
  });
  assert.deepEqual(obterIntervaloData({ dia: null, mes: 10, ano: 2026 }), {
    gte: new Date("2026-10-01T03:00:00.000Z"),
    lt: new Date("2026-11-01T03:00:00.000Z"),
  });
  assert.deepEqual(obterIntervaloData({ dia: null, mes: null, ano: 2026 }), {
    gte: new Date("2026-01-01T03:00:00.000Z"),
    lt: new Date("2027-01-01T03:00:00.000Z"),
  });
  assert.equal(obterIntervaloData({ dia: null, mes: null, ano: null }), undefined);
});

test("lista anos disponíveis do mais recente ao mais antigo", () => {
  assert.deepEqual(
    calcularAnosDisponiveis(new Date("2024-04-01T03:00:00.000Z"), new Date("2026-10-07T15:00:00.000Z")),
    [2026, 2025, 2024],
  );
});

test("normaliza dados válidos do checkout", () => {
  assert.deepEqual(normalizarDadosEntrega({
    nomeCliente: "  Maria   da Silva ",
    telefone: "+55 (11) 99999-9999",
    cep: "01234-567",
    rua: " Rua   das Pizzas ",
    numero: " 123 A ",
    bairro: " Centro ",
    complemento: "   ",
    referencia: " Próximo   à praça ",
  }), {
    nomeCliente: "Maria da Silva",
    telefone: "11999999999",
    cep: "01234567",
    rua: "Rua das Pizzas",
    numero: "123 A",
    bairro: "Centro",
    complemento: null,
    referencia: "Próximo à praça",
  });
});

test("rejeita campos obrigatórios e formatos inválidos do checkout", () => {
  const base = {
    nomeCliente: "Maria da Silva",
    telefone: "(11) 99999-9999",
    cep: "01234-567",
    rua: "Rua das Pizzas",
    numero: "123",
    bairro: "Centro",
    complemento: "",
    referencia: "",
  };
  const invalidos = [
    { ...base, nomeCliente: "" },
    { ...base, telefone: "123" },
    { ...base, cep: "12345" },
    { ...base, rua: "" },
    { ...base, numero: "" },
    { ...base, bairro: "" },
  ];
  for (const dados of invalidos) {
    assert.throws(() => normalizarDadosEntrega(dados), DadosEntregaInvalidosError);
  }
  assert.deepEqual(normalizarFiltrosData({ dia: "29", mes: "2", ano: "2024" }), {
    dia: 29,
    mes: 2,
    ano: 2024,
  });
});

test("limita tentativas excessivas de pedido público", () => {
  const chave = "teste-pedido-publico";
  for (let tentativa = 0; tentativa < 20; tentativa += 1) {
    assert.equal(verificarLimitePedido(chave), null);
    registrarTentativaPedido(chave);
  }
  assert.ok((verificarLimitePedido(chave) ?? 0) > 0);
});
