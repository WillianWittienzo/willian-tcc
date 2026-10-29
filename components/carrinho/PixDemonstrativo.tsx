type Props = {
  pedidoId: number;
  valor: number;
  status: string;
};

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function celulaDoMarcador(linha: number, coluna: number, inicioLinha: number, inicioColuna: number) {
  const l = linha - inicioLinha;
  const c = coluna - inicioColuna;
  if (l < 0 || l > 6 || c < 0 || c > 6) return null;
  return l === 0 || l === 6 || c === 0 || c === 6 || (l >= 2 && l <= 4 && c >= 2 && c <= 4);
}

function gerarMatriz(pedidoId: number) {
  let estado = (pedidoId * 2654435761) >>> 0;
  return Array.from({ length: 21 * 21 }, (_, indice) => {
    const linha = Math.floor(indice / 21);
    const coluna = indice % 21;
    const marcador = celulaDoMarcador(linha, coluna, 0, 0)
      ?? celulaDoMarcador(linha, coluna, 0, 14)
      ?? celulaDoMarcador(linha, coluna, 14, 0);
    if (marcador !== null) return marcador;
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado % 3 === 0;
  });
}

export function PixDemonstrativo({ pedidoId, valor, status }: Props) {
  const matriz = gerarMatriz(pedidoId);

  return (
    <section className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center" aria-label="Pix demonstrativo">
      <h3 className="text-lg font-bold text-emerald-900">Pagamento Pix demonstrativo</h3>
      <p className="mt-1 text-sm font-semibold text-emerald-800">
        Pix demonstrativo — nenhum pagamento real será realizado
      </p>
      <div
        className="mx-auto mt-4 grid aspect-square w-48 grid-cols-[repeat(21,minmax(0,1fr))] bg-white p-3 shadow-sm"
        aria-label="QR Code ilustrativo e não escaneável"
        role="img"
      >
        {matriz.map((preenchida, indice) => (
          <span key={indice} className={preenchida ? "bg-slate-950" : "bg-white"} />
        ))}
      </div>
      <p className="mt-2 text-xs text-emerald-800">QR ilustrativo, sem chave Pix e sem dados bancários.</p>
      <dl className="mx-auto mt-4 max-w-sm space-y-2 rounded-lg bg-white p-3 text-left text-sm">
        <div className="flex justify-between gap-3"><dt>Pedido</dt><dd className="font-bold">#{pedidoId}</dd></div>
        <div className="flex justify-between gap-3"><dt>Valor definitivo</dt><dd className="font-bold">{moeda.format(valor)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Recebimento</dt><dd className="font-bold text-amber-700">{status}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-gray-600">A confirmação de pagamento permanece manual no painel administrativo.</p>
    </section>
  );
}
