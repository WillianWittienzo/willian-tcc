"use client"

import { useState } from "react"
import { Card, Categoria, cardapio, } from "@/components/data/cardapio"

export default function AdminProdutos() {

    const [produtos, setProdutos] = useState<Card[]>(cardapio)
    const [modalAberto, setModalAberto] = useState(false)

    const [nome, setNome] = useState("")
    const [descricao, setDescricao] = useState("")
    const [precoPequena, setPrecoPequena] = useState("")
    const [precoMedia, setPrecoMedia] = useState("")
    const [precoGrande, setPrecoGrande] = useState("")
    const [image, setImage] = useState("")
    const [categoria, setCategoria] = useState<Categoria>("Tradicional")

    function excluirProduto(id: number) {
        setProdutos(prev => prev.filter(p => p.id !== id))
    }

    function adicionarProduto(e: React.FormEvent) {
        e.preventDefault()

        const novoProduto: Card = {
            id: Date.now(),
            nome,
            description: descricao,
            categoria,
            image,
            tamanhos: [
                { nome: "Pequena", preco: Number(precoPequena) },
                { nome: "Média", preco: Number(precoMedia) },
                { nome: "Grande", preco: Number(precoGrande) }
            ]
        }

        setProdutos(prev => [...prev, novoProduto])

        setNome("")
        setDescricao("")
        setPrecoPequena("")
        setPrecoMedia("")
        setPrecoGrande("")
        setImage("")
        setCategoria("Tradicional")

        setModalAberto(false)
    }

    return (
        <div className="p-8">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>

                <button
                    onClick={() => setModalAberto(true)}
                    className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition"
                >
                    + Adicionar Produto
                </button>
            </div>

            {modalAberto && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white w-full max-w-md rounded-xl p-6 relative">

                        <button
                            onClick={() => setModalAberto(false)}
                            className="absolute top-3 right-3 text-gray-500"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-4">
                            Nova Pizza
                        </h2>

                        <form
                            onSubmit={adicionarProduto}
                            className="space-y-3"
                        >
                            
                                <textarea
                                placeholder="Nome da Pizza"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full border p-2 rounded-md"
                                required
                            />

                            <textarea
                                placeholder="Descrição"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full border p-2 rounded-md"
                                required
                            />


                            <select
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value as Categoria)}
                                className="w-full border p-2 rounded-md"
                            >
                                <option value="Tradicional">Tradicional</option>
                                <option value="Especial">Especial</option>
                                <option value="Doce">Doce</option>
                            </select>

                             <input
                                type="number"
                                placeholder="Preço Pequena"
                                value={precoPequena}
                                onChange={(e) => setPrecoPequena(e.target.value)}
                                className="w-full border p-2 rounded-md"
                                required
                            />

                            <input
                                type="number"
                                placeholder="Preço Grande"
                                value={precoGrande}
                                onChange={(e) => setPrecoGrande(e.target.value)}
                                className="w-full border p-2 rounded-md"
                                required
                            />

                             <input
                                type="number"
                                placeholder="Preço Média"
                                value={precoMedia}
                                onChange={(e) => setPrecoMedia(e.target.value)}
                                className="w-full border p-2 rounded-md"
                                required
                            />
                           
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalAberto(false)}
                                    className="px-4 py-2 border rounded-md"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-700 text-white rounded-md"
                                >
                                    Adicionar
                                </button>
                            </div>

                        </form>

                    </div>

                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {produtos.map(produto => (
                    <div
                        key={produto.id}
                        className="relative bg-white rounded-xl shadow-md overflow-hidden"
                    >

                        <div className="relative">
                            <img
                                src={produto.image}
                                alt={produto.nome}
                                className="w-full h-40 object-cover"
                            />

                            <div className="absolute top-3 left-3 z-10 bg-red-800/90 backdrop-blur-sm rounded-lg px-3 py-1">
                                <p className="text-[13px] text-white leading-none">
                                    {produto.categoria}
                                </p>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="text-xl font-semibold">
                                {produto.nome}
                            </h3>

                            <p className="text-gray-600 text-sm mb-2">
                                {produto.description}
                            </p>

                            <p className="font-bold text-red-700 mb-3">
                                <p className="font-bold text-red-700 mb-3">
                                    Pequena: R$ {produto.tamanhos[0].preco.toFixed(2)}
                                </p>
                            </p>

                            <button
                                onClick={() => excluirProduto(produto.id)}
                                className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 transition "
                            >
                                Excluir
                            </button>
                        </div>

                    </div>
                ))}

            </div>
        </div>
    )
}