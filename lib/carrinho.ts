import type { NomeBorda, TamanhoProduto } from "@/lib/catalogo";

type ConfiguracaoItem = {
  id: number;
  tamanho: TamanhoProduto;
  borda: NomeBorda;
};

export function itensTemMesmaConfiguracao(
  item: ConfiguracaoItem,
  outroItem: ConfiguracaoItem,
) {
  return item.id === outroItem.id
    && item.tamanho === outroItem.tamanho
    && item.borda === outroItem.borda;
}
