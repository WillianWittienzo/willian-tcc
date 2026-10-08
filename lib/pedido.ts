export const TAXA_ENTREGA_EM_CENTAVOS = 800;
export const LIMITE_ENTREGA_GRATIS_EM_CENTAVOS = 8000;

export type MetodoEntrega = "Entrega" | "Retirada";

export function calcularTaxaEntregaEmCentavos(
  subtotalEmCentavos: number,
  metodoEntrega: MetodoEntrega = "Entrega",
) {
  if (metodoEntrega === "Retirada") return 0;
  return subtotalEmCentavos >= LIMITE_ENTREGA_GRATIS_EM_CENTAVOS
    ? 0
    : TAXA_ENTREGA_EM_CENTAVOS;
}
