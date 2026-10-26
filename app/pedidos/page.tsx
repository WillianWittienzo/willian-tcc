"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { cancelarMeuPedido, listarMeusPedidos, type Pedido } from "@/client/pedidoClient";
import { PedidoCard } from "@/components/pedidos/PedidoCard";

export default function MeusPedidosPage() {
  const [pedidosDoCliente, setPedidosDoCliente] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const { user, carregando: carregandoSessao } = useAuth();
  const router = useRouter();

  const carregarPedidos = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setPedidosDoCliente(await listarMeusPedidos());
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao buscar pedidos");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (carregandoSessao) return;
    if (!user) {
      router.replace("/login?retorno=/pedidos");
      return;
    }
    if (user.papel !== "Cliente") {
      router.replace("/admin");
      return;
    }
    void carregarPedidos();
  }, [carregandoSessao, carregarPedidos, router, user]);

  async function cancelar(pedido: Pedido) {
    const confirmado = window.confirm(
      `Cancelar o pedido #${pedido.id}? Esta ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    setCancelandoId(pedido.id);
    setErro("");
    try {
      const atualizado = await cancelarMeuPedido(pedido.id);
      setPedidosDoCliente((atuais) =>
        atuais.map((item) => item.id === atualizado.id ? atualizado : item),
      );
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao cancelar pedido");
      await carregarPedidos();
    } finally {
      setCancelandoId(null);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-28">
      <h1 className="mb-2 text-3xl font-bold">Minhas Pizzas</h1>
      <p className="mb-6 text-gray-600">Acompanhe os detalhes e o status dos seus pedidos.</p>

      {carregandoSessao || carregando ? (
        <div className="rounded-xl bg-white p-6 text-center text-gray-600 shadow">
          Carregando pedidos...
        </div>
      ) : erro ? (
        <div className="rounded-xl bg-white p-6 text-center text-red-700 shadow" role="alert">
          {erro}
        </div>
      ) : pedidosDoCliente.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow">
          <p className="text-gray-600">Você ainda não possui pedidos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidosDoCliente.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido}>
              {pedido.status === "Pendente" && (
                <div className="border-t pt-4">
                  <button
                    type="button"
                    disabled={cancelandoId !== null}
                    onClick={() => void cancelar(pedido)}
                    className="rounded-md border border-red-700 px-4 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancelandoId === pedido.id ? "Cancelando..." : "Cancelar pedido"}
                  </button>
                </div>
              )}
            </PedidoCard>
          ))}
        </div>
      )}
    </main>
  );
}
