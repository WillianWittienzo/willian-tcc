"use client";

import { useEffect, useState } from "react";
import { CardList } from "@/components/cardapio/CardList";
import { FilterMenu } from "@/components/cardapio/FilterMenu";
import { listarProdutos } from "@/client/produtoClient";
import { consultarFuncionamento } from "@/client/funcionamentoClient";
import type { Card } from "@/components/data/cardapio";
import type { SituacaoFuncionamento } from "@/lib/funcionamento";

export default function CardapioPage() {


  const [produtos, setProdutos] = useState<Card[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [funcionamento, setFuncionamento] = useState<SituacaoFuncionamento | null>(null);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const dados = await listarProdutos();
        setProdutos(dados);
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Erro ao carregar produtos");
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
    consultarFuncionamento().then(setFuncionamento).catch(() => {});
  }, []);


  const pizzasFiltradas =
    categoriaAtiva === "Todas"
      ? produtos
      : produtos.filter(p => p.categoria === categoriaAtiva);


  return (

    <main className="py-20">
      <section>
        <div className="mx-auto max-w-8xl py-20 -mt-4 bg-[hsl(0deg_83.78%_21.76%)]">
          <h1 className="text-6xl font-bold text-amber-50 flex items-center justify-center gap-2">
            Nosso<span className="text-amber-500">Cardápio</span>
          </h1>
          <p className="text-amber-50 flex justify-center text-sm">
            Escolha sua Pizza favorita
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl py-10 px-6">
          <FilterMenu
            categoriaAtiva={categoriaAtiva}
            setCategoriaAtiva={setCategoriaAtiva}
          />

          {funcionamento && !funcionamento.aberto && (
            <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-center text-amber-950" role="status">
              <p className="font-bold">Pizzaria fechada no momento</p>
              <p className="mt-1 text-sm">{funcionamento.mensagem} Você pode consultar o cardápio e manter itens no carrinho.</p>
            </div>
          )}

          {carregando ? (
            <div className="rounded-xl bg-white p-10 text-center shadow" role="status">
              <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-red-200 border-t-red-700" aria-hidden="true" />
              <p className="mt-3 font-semibold text-gray-700">Preparando o cardápio...</p>
            </div>
          ) : erro ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800" role="alert">
              <p className="font-bold">Não foi possível carregar o cardápio</p>
              <p className="mt-1 text-sm">{erro}</p>
              <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-md bg-red-700 px-4 py-2 font-semibold text-white">Tentar novamente</button>
            </div>
          ) : <CardList items={pizzasFiltradas} />}
        </div>
      </section>
    </main>
  );
}
