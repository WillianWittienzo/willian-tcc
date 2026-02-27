import CardDashboard from "@/components/adm/CardDashboard"

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">DASHBOARD</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardDashboard title="Total de Pedidos" value="0" />
        <CardDashboard title="Receita Total" value="R$ 0,00" />
        <CardDashboard title="Clientes" value="0" />
        <CardDashboard title="Produtos" value="10" />
      </div>
    </div>
  )
}