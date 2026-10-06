export const TAXA_ENTREGA_EM_CENTAVOS = 800;
export const LIMITE_ENTREGA_GRATIS_EM_CENTAVOS = 8000;

export function calcularTaxaEntregaEmCentavos(subtotalEmCentavos: number) {
  return subtotalEmCentavos >= LIMITE_ENTREGA_GRATIS_EM_CENTAVOS
    ? 0
    : TAXA_ENTREGA_EM_CENTAVOS;
}
