import type { Pedido } from "@/client/pedidoClient";
import { PedidoCard } from "@/components/pedidos/PedidoCard";

export default function MeusPedidosPage() {
  // A lista só poderá ser preenchida por um endpoint autenticado que obtenha
  // o usuário no servidor. Não usamos clienteId vindo do navegador.
  const pedidosDoCliente: Pedido[] = [];

  return (
    <main className="max-w-4xl mx-auto px-6 py-28 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>

      {pedidosDoCliente.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-600">
            O acompanhamento dos seus pedidos estará disponível quando o login
            estiver integrado ao banco de dados.
          </p>
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
