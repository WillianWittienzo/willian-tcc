"use client";

import { useEffect, useState } from "react";
import { listarMeusPedidos, type Pedido } from "@/client/pedidoClient";
import { PedidoCard } from "@/components/pedidos/PedidoCard";

export default function MeusPedidosPage() {
  const [pedidosDoCliente, setPedidosDoCliente] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarMeusPedidos()
      .then(setPedidosDoCliente)
      .catch((error: unknown) =>
        setErro(error instanceof Error ? error.message : "Erro ao buscar pedidos")
      )
      .finally(() => setCarregando(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-28 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>

      {carregando ? (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-600">
          Carregando pedidos...
        </div>
      ) : erro ? (
        <div className="bg-white p-6 rounded-xl shadow text-center text-red-700">
          {erro}
        </div>
      ) : pedidosDoCliente.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-600">Você ainda não possui pedidos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidosDoCliente.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido} />
          ))}
        </div>
      )}
    </main>
  );
}
