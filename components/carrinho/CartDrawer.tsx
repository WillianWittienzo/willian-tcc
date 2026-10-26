"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useCart, type CartItem } from "@/app/context/CartContext";
import { PizzaCustomizationModal } from "@/components/cardapio/PizzaCustomizationModal";
import { criarUrlAutenticacao, ROTA_CHECKOUT } from "@/lib/checkout";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CartDrawer() {
  const router = useRouter();
  const { user, carregando } = useAuth();
  const {
    items,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    updateCartItem,
    carrinhoAberto,
    fecharCarrinho,
  } = useCart();
  const [itemEditando, setItemEditando] = useState<CartItem | null>(null);
  const [mensagemFinalizacao, setMensagemFinalizacao] = useState("");
  const totalItens = items.reduce((total, item) => total + item.quantidade, 0);
  const subtotal = items.reduce(
    (total, item) => total + (item.preco + item.precoBorda) * item.quantidade,
    0,
  );

  useEffect(() => {
    if (!carrinhoAberto) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !itemEditando) fecharCarrinho();
    }

    window.addEventListener("keydown", fecharComEscape);
    return () => {
      window.removeEventListener("keydown", fecharComEscape);
      document.body.style.overflow = overflowAnterior;
    };
  }, [carrinhoAberto, fecharCarrinho, itemEditando]);

  function finalizarCompra() {
    if (!items.length || carregando) return;
    setMensagemFinalizacao("");

    if (!user) {
      fecharCarrinho();
      router.push(criarUrlAutenticacao("/login"));
      return;
    }
    if (user.papel === "Admin") {
      setMensagemFinalizacao("Para comprar, saia da conta administrativa e entre com uma conta de cliente.");
      return;
    }

    fecharCarrinho();
    router.push(ROTA_CHECKOUT);
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          carrinhoAberto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!carrinhoAberto}
        inert={!carrinhoAberto}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) fecharCarrinho();
        }}
      >
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-carrinho-lateral"
          className={`ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
            carrinhoAberto ? "translate-x-0" : "translate-x-full"
          }`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
            <div>
              <h2 id="titulo-carrinho-lateral" className="text-xl font-bold">Carrinho de compras</h2>
              <p className="text-sm text-gray-500">{totalItens} {totalItens === 1 ? "item" : "itens"}</p>
            </div>
            <button
              type="button"
              onClick={fecharCarrinho}
              aria-label="Fechar carrinho"
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <X aria-hidden="true" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {!items.length ? (
              <div className="flex h-full min-h-52 flex-col items-center justify-center text-center text-gray-500">
                <p className="text-lg font-semibold">Seu carrinho está vazio.</p>
                <p className="mt-1 text-sm">Escolha uma pizza para começar.</p>
              </div>
            ) : items.map((item) => {
              const chave = { id: item.id, tamanho: item.tamanho, borda: item.borda, observacao: item.observacao };
              const valorUnitario = item.preco + item.precoBorda;
              return (
                <article key={`${item.id}-${item.tamanho}-${item.borda}-${item.observacao ?? ""}`} className="border-b py-4 first:pt-0">
                  <div className="flex gap-3">
                    <Image
                      src={item.image}
                      alt={item.nome}
                      width={80}
                      height={80}
                      unoptimized={item.image.startsWith("http")}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold">{item.nome}</h3>
                        <button
                          type="button"
                          onClick={() => removeFromCart(chave)}
                          aria-label={`Remover ${item.nome}`}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{item.tamanho} · {item.borda}</p>
                      {item.observacao && <p className="mt-1 text-sm text-gray-600">Observação: {item.observacao}</p>}
                      <p className="mt-1 text-sm text-gray-600">Unitário: {moeda.format(valorUnitario)}</p>
                      <button
                        type="button"
                        onClick={() => setItemEditando(item)}
                        className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline"
                      >
                        <Pencil size={14} aria-hidden="true" /> Editar personalização
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(chave)}
                        aria-label={`Diminuir quantidade de ${item.nome}`}
                        className="grid h-8 w-8 place-items-center rounded-md border border-red-600 text-red-700 disabled:opacity-40"
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>
                      <span className="min-w-6 text-center font-semibold">{item.quantidade}</span>
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        disabled={item.quantidade >= 99}
                        aria-label={`Aumentar quantidade de ${item.nome}`}
                        className="grid h-8 w-8 place-items-center rounded-md border border-red-600 text-red-700 disabled:opacity-40"
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <p className="font-bold">{moeda.format(valorUnitario * item.quantidade)}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <footer className="border-t bg-white p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] sm:p-6">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span>{moeda.format(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">A taxa de entrega será calculada no checkout.</p>
            {mensagemFinalizacao && (
              <p role="alert" className="mt-2 rounded-md bg-amber-50 p-2 text-sm text-amber-900">
                {mensagemFinalizacao}
              </p>
            )}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={fecharCarrinho}
                className="rounded-lg border border-red-600 px-4 py-3 font-semibold text-red-700 hover:bg-red-50"
              >
                Continuar comprando
              </button>
              <button
                type="button"
                onClick={finalizarCompra}
                disabled={!items.length || carregando}
                className="rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {carregando ? "Verificando sessão..." : "Finalizar compra"}
              </button>
            </div>
          </footer>
        </aside>
      </div>

      {itemEditando && (
        <PizzaCustomizationModal
          produto={{
            id: itemEditando.id,
            nome: itemEditando.nome,
            categoria: itemEditando.categoria,
            description: itemEditando.description,
            image: itemEditando.image,
            descontoPercentual: itemEditando.descontoPercentual,
            tamanhos: itemEditando.tamanhos,
          }}
          configuracaoInicial={itemEditando}
          onClose={() => setItemEditando(null)}
          onConfirmar={(item, quantidade) => updateCartItem(
            {
              id: itemEditando.id,
              tamanho: itemEditando.tamanho,
              borda: itemEditando.borda,
              observacao: itemEditando.observacao,
            },
            item,
            quantidade,
          )}
        />
      )}
    </>
  );
}
