import assert from "node:assert/strict";
import test from "node:test";
import { itensTemMesmaConfiguracao } from "../lib/carrinho";
import { aplicarDesconto, buscarBorda } from "../lib/catalogo";
import { calcularTaxaEntregaEmCentavos } from "../lib/pedido";

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
