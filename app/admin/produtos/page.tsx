"use client"

import { useEffect, useState } from "react"
import type { Card, Categoria } from "@/components/data/cardapio"
import {
    listarProdutos,
    criarProduto,
    atualizarProduto,
    excluirProduto
} from "@/client/produtoClient"

export default function AdminProdutos() {

    const [produtos, setProdutos] = useState<Card[]>([])
    const [modalAberto, setModalAberto] = useState(false)
    const [produtoEmEdicao, setProdutoEmEdicao] = useState<number | null>(null)

    const [nome, setNome] = useState("")
    const [descricao, setDescricao] = useState("")
    const [precoPequena, setPrecoPequena] = useState("")
    const [precoMedia, setPrecoMedia] = useState("")
    const [precoGrande, setPrecoGrande] = useState("")
    const [image, setImage] = useState("")
    const [categoria, setCategoria] = useState<Categoria>("Tradicional")

    // Busca os produtos do banco quando a página abre
    useEffect(() => {
        async function carregarProdutos() {
            try {
                const dados = await listarProdutos()
                setProdutos(dados)
            } catch (error) {
                console.error("Erro ao carregar produtos:", error)
            }
        }

        carregarProdutos()
    }, [])

    async function removerProduto(id: number) {
        try {
            await excluirProduto(id)

            setProdutos(prev =>
                prev.filter(produto => produto.id !== id)
            )
        } catch (error) {
            console.error("Erro ao excluir produto:", error)
        }
    }

    function limparFormulario() {
        setNome("")
        setDescricao("")
        setPrecoPequena("")
        setPrecoMedia("")
        setPrecoGrande("")
        setImage("")
        setCategoria("Tradicional")
        setProdutoEmEdicao(null)
    }

    function fecharModal() {
        setModalAberto(false)
        limparFormulario()
    }

    function abrirNovoProduto() {
        limparFormulario()
        setModalAberto(true)
    }

    function editarProduto(produto: Card) {
        setProdutoEmEdicao(produto.id)
        setNome(produto.nome)
        setDescricao(produto.description)
        setCategoria(produto.categoria)
        setImage(produto.image)
        setPrecoPequena(String(produto.tamanhos.find(t => t.nome === "Pequena")?.preco ?? ""))
        setPrecoMedia(String(produto.tamanhos.find(t => t.nome === "Média")?.preco ?? ""))
        setPrecoGrande(String(produto.tamanhos.find(t => t.nome === "Grande")?.preco ?? ""))
        setModalAberto(true)
    }

    // Cadastra um novo produto ou atualiza um existente no banco
    async function adicionarProduto(e: React.FormEvent) {
        e.preventDefault()

        try {
            const dadosProduto: Parameters<typeof criarProduto>[0] = {
                nome,
                description: descricao,
                categoria,
                image,
                tamanhos: [
                    {
                        nome: "Pequena",
                        preco: Number(precoPequena)
                    },
                    {
                        nome: "Média",
                        preco: Number(precoMedia)
                    },
                    {
                        nome: "Grande",
                        preco: Number(precoGrande)
                    }
                ]
            }

            if (produtoEmEdicao !== null) {
                const produtoAtualizado = await atualizarProduto(produtoEmEdicao, dadosProduto)
                setProdutos(prev => prev.map(produto =>
                    produto.id === produtoEmEdicao ? produtoAtualizado : produto
                ))
            } else {
                const novoProduto = await criarProduto(dadosProduto)
                setProdutos(prev => [...prev, novoProduto])
            }

            fecharModal()

        } catch (error) {
            console.error("Erro ao salvar produto:", error)
        }
    }

    return (
        <div className="p-8">

            <div className="flex justify-between items-center mb-6">

                <h1 className="text-3xl font-bold">
                    Gerenciar Produtos
                </h1>

                <button
                    onClick={abrirNovoProduto}
                    className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition"
                >
                    + Adicionar Produto
                </button>

            </div>

            {modalAberto && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white w-full max-w-md rounded-xl p-6 relative">

                        <button
                            onClick={fecharModal}
                            className="absolute top-3 right-3 text-gray-500"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-4">
                            {produtoEmEdicao !== null ? "Editar Pizza" : "Nova Pizza"}
                        </h2>

                        <form
                            onSubmit={adicionarProduto}
                            className="space-y-3"
                        >

                            {/* Nome */}
                            <textarea
                                placeholder="Nome da Pizza"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full border p-2 rounded-md"
                                required
                            />

                            {/* Descrição */}
                            <textarea
                                placeholder="Descrição"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full border p-2 rounded-md"
                                required
                            />

                            {/* Categoria */}
                            <select
                                value={categoria}
                                onChange={(e) =>
                                    setCategoria(e.target.value as Categoria)
                                }
                                className="w-full border p-2 rounded-md"
                            >
                                <option value="Tradicional">
                                    Tradicional
                                </option>

                                <option value="Especial">
                                    Especial
                                </option>

                                <option value="Doce">
                                    Doce
                                </option>
                            </select>

                            {/* Preço Pequena */}
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Preço Pequena"
                                value={precoPequena}
                                onChange={(e) =>
                                    setPrecoPequena(e.target.value)
                                }
                                className="w-full border p-2 rounded-md"
                                required
                            />

                            {/* Preço Média */}
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Preço Média"
                                value={precoMedia}
                                onChange={(e) =>
                                    setPrecoMedia(e.target.value)
                                }
                                className="w-full border p-2 rounded-md"
                                required
                            />

                            {/* Preço Grande */}
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Preço Grande"
                                value={precoGrande}
                                onChange={(e) =>
                                    setPrecoGrande(e.target.value)
                                }
                                className="w-full border p-2 rounded-md"
                                required
                            />

                            {/* URL da imagem */}
                            <input
                                type="text"
                                placeholder="URL da imagem"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                className="w-full border p-2 rounded-md"
                                required
                            />

                            <div className="flex justify-end gap-2">

                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    className="px-4 py-2 border rounded-md"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-700 text-white rounded-md"
                                >
                                    {produtoEmEdicao !== null ? "Salvar" : "Adicionar"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* Lista de produtos */}
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
                                Pequena: R$ {produto.tamanhos[0].preco.toFixed(2)}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => editarProduto(produto)}
                                    className="bg-red-700 text-white px-3 py-1 rounded-md hover:bg-red-800 transition"
                                >
                                    Editar
                                </button>

                                <button
                                    onClick={() => removerProduto(produto.id)}
                                    className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 transition"
                                >
                                    Excluir
                                </button>
                            </div>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    )
}
