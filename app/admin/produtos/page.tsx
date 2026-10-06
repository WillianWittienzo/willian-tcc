"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Card, Categoria } from "@/components/data/cardapio";
import { atualizarProduto, criarProduto, excluirProduto, listarProdutos } from "@/client/produtoClient";

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Card[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoPequena, setPrecoPequena] = useState("");
  const [precoMedia, setPrecoMedia] = useState("");
  const [precoGrande, setPrecoGrande] = useState("");
  const [image, setImage] = useState("");
  const [desconto, setDesconto] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("Tradicional");

  useEffect(() => {
    listarProdutos().then(setProdutos).catch((error) => setErro(error instanceof Error ? error.message : "Erro ao carregar produtos"));
  }, []);

  function limparFormulario() {
    setNome(""); setDescricao(""); setPrecoPequena(""); setPrecoMedia(""); setPrecoGrande("");
    setImage(""); setDesconto(""); setCategoria("Tradicional"); setProdutoEmEdicao(null); setErro("");
  }

  function fecharModal() { setModalAberto(false); limparFormulario(); }
  function abrirNovoProduto() { limparFormulario(); setModalAberto(true); }
  function editarProduto(produto: Card) {
    setProdutoEmEdicao(produto.id);
    setNome(produto.nome);
    setDescricao(produto.description);
    setCategoria(produto.categoria);
    setImage(produto.image);
    setDesconto(produto.descontoPercentual === null ? "" : String(produto.descontoPercentual));
    setPrecoPequena(String(produto.tamanhos.find((t) => t.nome === "Pequena")?.preco ?? ""));
    setPrecoMedia(String(produto.tamanhos.find((t) => t.nome === "Média")?.preco ?? ""));
    setPrecoGrande(String(produto.tamanhos.find((t) => t.nome === "Grande")?.preco ?? ""));
    setErro(""); setModalAberto(true);
  }

  async function removerProduto(id: number) {
    if (!confirm("Excluir este produto? Pedidos antigos serão preservados.")) return;
    try {
      await excluirProduto(id);
      setProdutos((atuais) => atuais.filter((produto) => produto.id !== id));
    } catch (error) { setErro(error instanceof Error ? error.message : "Erro ao excluir produto"); }
  }

  async function salvarProduto(event: React.FormEvent) {
    event.preventDefault();
    setErro("");
    const dados = {
      nome,
      description: descricao,
      categoria,
      image,
      descontoPercentual: desconto === "" ? null : Number(desconto),
      tamanhos: [
        { nome: "Pequena" as const, preco: Number(precoPequena) },
        { nome: "Média" as const, preco: Number(precoMedia) },
        { nome: "Grande" as const, preco: Number(precoGrande) },
      ],
    };
    try {
      if (produtoEmEdicao === null) {
        const novo = await criarProduto(dados);
        setProdutos((atuais) => [...atuais, novo]);
      } else {
        const atualizado = await atualizarProduto(produtoEmEdicao, dados);
        setProdutos((atuais) => atuais.map((produto) => produto.id === produtoEmEdicao ? atualizado : produto));
      }
      fecharModal();
    } catch (error) { setErro(error instanceof Error ? error.message : "Erro ao salvar produto"); }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
        <button type="button" onClick={abrirNovoProduto} className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition">+ Adicionar Produto</button>
      </div>
      {erro && !modalAberto && <p className="mb-4 rounded bg-red-100 p-3 text-red-800">{erro}</p>}

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl p-6 relative">
            <button type="button" onClick={fecharModal} className="absolute top-3 right-3 text-gray-500" aria-label="Fechar">✕</button>
            <h2 className="text-2xl font-bold mb-4">{produtoEmEdicao === null ? "Nova Pizza" : "Editar Pizza"}</h2>
            {erro && <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-800">{erro}</p>}
            <form onSubmit={salvarProduto} className="space-y-3">
              <input type="text" maxLength={80} placeholder="Nome da pizza" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border p-2 rounded-md" required />
              <textarea maxLength={500} placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border p-2 rounded-md" required />
              <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)} className="w-full border p-2 rounded-md">
                <option value="Tradicional">Tradicional</option><option value="Especial">Especial</option><option value="Doce">Doce</option>
              </select>
              <input type="number" min="0.01" max="10000" step="0.01" placeholder="Preço Pequena" value={precoPequena} onChange={(e) => setPrecoPequena(e.target.value)} className="w-full border p-2 rounded-md" required />
              <input type="number" min="0.01" max="10000" step="0.01" placeholder="Preço Média" value={precoMedia} onChange={(e) => setPrecoMedia(e.target.value)} className="w-full border p-2 rounded-md" required />
              <input type="number" min="0.01" max="10000" step="0.01" placeholder="Preço Grande" value={precoGrande} onChange={(e) => setPrecoGrande(e.target.value)} className="w-full border p-2 rounded-md" required />
              <label className="block text-sm font-medium">Promoção (% de desconto, deixe vazio para desativar)</label>
              <input type="number" min="1" max="90" step="1" placeholder="Ex.: 15" value={desconto} onChange={(e) => setDesconto(e.target.value)} className="w-full border p-2 rounded-md" />
              <label className="block text-sm font-medium">Imagem (caminho local ou URL HTTPS)</label>
              <input type="text" maxLength={500} placeholder="/pizzas/nome.jpg" value={image} onChange={(e) => setImage(e.target.value)} className="w-full border p-2 rounded-md" required={produtoEmEdicao === null} />
              {produtoEmEdicao !== null && <p className="text-xs text-gray-500">Se este campo for apagado, a imagem atual será preservada.</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={fecharModal} className="px-4 py-2 border rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-red-700 text-white rounded-md">{produtoEmEdicao === null ? "Adicionar" : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((produto) => (
          <div key={produto.id} className="relative bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative h-40 w-full">
              <Image src={produto.image} alt={produto.nome} fill unoptimized={produto.image.startsWith("http")} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              <span className="absolute top-3 left-3 z-10 bg-red-800/90 rounded-lg px-3 py-1 text-[13px] text-white">{produto.categoria}</span>
              {produto.descontoPercentual !== null && <span className="absolute right-3 top-3 rounded-lg bg-amber-500 px-3 py-1 text-sm font-bold">-{produto.descontoPercentual}%</span>}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold">{produto.nome}</h3>
              <p className="text-gray-600 text-sm mb-2">{produto.description}</p>
              <p className="font-bold text-red-700 mb-3">Pequena: R$ {(produto.tamanhos[0]?.precoPromocional ?? produto.tamanhos[0]?.preco ?? 0).toFixed(2)}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => editarProduto(produto)} className="bg-red-700 text-white px-3 py-1 rounded-md hover:bg-red-800 transition">Editar</button>
                <button type="button" onClick={() => removerProduto(produto.id)} className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 transition">Excluir</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
