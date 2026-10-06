import assert from "node:assert/strict";
import test from "node:test";
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

test("aceita somente as duas bordas fixas", () => {
  assert.deepEqual(buscarBorda("Catupiry"), { nome: "Catupiry", preco: 5 });
  assert.deepEqual(buscarBorda("Cheddar"), { nome: "Cheddar", preco: 5 });
  assert.equal(buscarBorda("Outra"), undefined);
});
