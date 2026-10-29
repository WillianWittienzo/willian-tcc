"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useCart, type CartItem } from "@/app/context/CartContext";
import type { Card, Tamanho } from "@/components/data/cardapio";
import { BORDAS } from "@/lib/catalogo";

type Props = {
  produto: Card;
  onClose: () => void;
  onAdded?: () => void;
  configuracaoInicial?: Pick<CartItem, "tamanho" | "borda" | "observacao" | "quantidade">;
  onConfirmar?: (item: Omit<CartItem, "quantidade">, quantidade: number) => void;
};

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function PizzaCustomizationModal({
  produto,
  onClose,
  onAdded,
  configuracaoInicial,
  onConfirmar,
}: Props) {
  const tamanhosValidos = useMemo(
    () => produto.tamanhos.filter(
      (tamanho) => Number.isFinite(tamanho.preco) && tamanho.preco > 0,
    ),
    [produto.tamanhos],
  );
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Tamanho>(
    tamanhosValidos.find((tamanho) => tamanho.nome === configuracaoInicial?.tamanho) ?? tamanhosValidos[0],
  );
  const [bordaSelecionada, setBordaSelecionada] = useState<(typeof BORDAS)[number]>(
    BORDAS.find((borda) => borda.nome === configuracaoInicial?.borda) ?? BORDAS[0],
  );
  const [quantidade, setQuantidade] = useState(configuracaoInicial?.quantidade ?? 1);
  const [observacao, setObservacao] = useState(configuracaoInicial?.observacao ?? "");
  const botaoFechar = useRef<HTMLButtonElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botaoFechar.current?.focus();

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", fecharComEscape);
    return () => {
      window.removeEventListener("keydown", fecharComEscape);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onClose]);

  const precoPizza = tamanhoSelecionado.precoPromocional ?? tamanhoSelecionado.preco;
  const total = (precoPizza + bordaSelecionada.preco) * quantidade;

  function adicionar() {
    if (!produto.disponivel) return;
    const item = {
      id: produto.id,
      nome: produto.nome,
      categoria: produto.categoria,
      image: produto.image,
      description: produto.description,
      preco: precoPizza,
      precoOriginal: tamanhoSelecionado.preco,
      descontoPercentual: produto.descontoPercentual,
      tamanho: tamanhoSelecionado.nome,
      borda: bordaSelecionada.nome,
      precoBorda: bordaSelecionada.preco,
      observacao: observacao.trim(),
      tamanhos: produto.tamanhos,
    };

    if (onConfirmar) onConfirmar(item, quantidade);
    else addToCart(item, quantidade);
    onClose();
    onAdded?.();
  }

  function alterarQuantidade(valor: number) {
    if (Number.isInteger(valor) && valor >= 1 && valor <= 99) setQuantidade(valor);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`titulo-pizza-${produto.id}`}
        aria-describedby={`descricao-pizza-${produto.id}`}
        className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <button
          ref={botaoFechar}
          type="button"
          onClick={onClose}
          aria-label="Fechar personalização"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/95 p-2 text-gray-700 shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <X aria-hidden="true" />
        </button>

        <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-56 md:min-h-full">
            <Image
              src={produto.image}
              alt={produto.nome}
              fill
              unoptimized={produto.image.startsWith("http")}
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover md:rounded-l-2xl"
            />
            {produto.descontoPercentual !== null && (
              <span className="absolute left-4 top-4 rounded-lg bg-amber-500 px-3 py-1 font-bold text-black">
                {produto.descontoPercentual}% de desconto
              </span>
            )}
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">{produto.categoria}</p>
            <h2 id={`titulo-pizza-${produto.id}`} className="mt-1 pr-10 text-2xl font-bold sm:text-3xl">
              {produto.nome}
            </h2>
            <p id={`descricao-pizza-${produto.id}`} className="mt-2 text-gray-600">{produto.description}</p>

            <fieldset className="mt-6">
              <legend className="font-bold">Escolha o tamanho</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {tamanhosValidos.map((tamanho) => (
                  <button
                    key={tamanho.nome}
                    type="button"
                    aria-pressed={tamanhoSelecionado.nome === tamanho.nome}
                    onClick={() => setTamanhoSelecionado(tamanho)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      tamanhoSelecionado.nome === tamanho.nome
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-gray-300 hover:border-red-500"
                    }`}
                  >
                    {tamanho.nome} · {moeda.format(tamanho.precoPromocional ?? tamanho.preco)}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-5 block font-bold" htmlFor={`borda-modal-${produto.id}`}>
              Escolha a borda
            </label>
            <select
              id={`borda-modal-${produto.id}`}
              value={bordaSelecionada.nome}
              onChange={(event) => setBordaSelecionada(
                BORDAS.find((borda) => borda.nome === event.target.value) ?? BORDAS[0],
              )}
              className="mt-2 w-full rounded-md border border-gray-300 p-3 focus:border-red-600 focus:outline-none"
            >
              {BORDAS.map((borda) => (
                <option key={borda.nome} value={borda.nome}>
                  {borda.nome} {borda.preco === 0 ? "— sem acréscimo" : `(+${moeda.format(borda.preco)})`}
                </option>
              ))}
            </select>

            <label className="mt-5 block font-bold" htmlFor={`observacao-modal-${produto.id}`}>
              Observações para esta pizza
            </label>
            <textarea
              id={`observacao-modal-${produto.id}`}
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Ex.: sem cebola, pouco molho, bem assada"
              className="mt-2 w-full resize-y rounded-md border border-gray-300 p-3 focus:border-red-600 focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-gray-500">{observacao.length}/200</p>

            <div className="mt-5">
              <span className="font-bold">Quantidade</span>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => alterarQuantidade(quantidade - 1)}
                  disabled={quantidade === 1}
                  aria-label="Diminuir quantidade"
                  className="h-10 w-10 rounded-md border border-red-600 text-xl text-red-700 disabled:opacity-40"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={quantidade}
                  onChange={(event) => alterarQuantidade(Number(event.target.value))}
                  aria-label="Quantidade"
                  className="h-10 w-16 rounded-md border text-center"
                />
                <button
                  type="button"
                  onClick={() => alterarQuantidade(quantidade + 1)}
                  disabled={quantidade === 99}
                  aria-label="Aumentar quantidade"
                  className="h-10 w-10 rounded-md border border-red-600 text-xl text-red-700 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 border-t pt-5">
              {tamanhoSelecionado.precoPromocional !== null && (
                <p className="text-sm text-gray-500">
                  De <span className="line-through">{moeda.format((tamanhoSelecionado.preco + bordaSelecionada.preco) * quantidade)}</span>
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-2xl font-bold text-[hsl(33_100%_45%)]">{moeda.format(total)}</p>
                <button
                  type="button"
                  onClick={adicionar}
                  disabled={!produto.disponivel}
                  className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-500"
                >
                  {!produto.disponivel ? "Pizza indisponível" : onConfirmar ? "Salvar alterações" : "Adicionar ao carrinho"}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">O preço definitivo será validado no servidor no checkout.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
