export const CATEGORIAS = ["Tradicional", "Especial", "Doce"] as const;
export type CategoriaProduto = (typeof CATEGORIAS)[number];

export const TAMANHOS = ["Pequena", "Média", "Grande"] as const;
export type TamanhoProduto = (typeof TAMANHOS)[number];

export const BORDAS = [
  { nome: "Sem borda", preco: 0 },
  { nome: "Catupiry", preco: 5 },
  { nome: "Cheddar", preco: 5 },
] as const;

export type NomeBorda = (typeof BORDAS)[number]["nome"];
export type NomeBordaRecheada = Exclude<NomeBorda, "Sem borda">;

export function buscarBorda(nome: unknown) {
  return typeof nome === "string"
    ? BORDAS.find((borda) => borda.nome === nome)
    : undefined;
}

export function aplicarDesconto(preco: number, descontoPercentual: number | null) {
  if (descontoPercentual === null) return preco;
  return Math.round(preco * (100 - descontoPercentual)) / 100;
}
