import { redirect } from "next/navigation"
import Sidebar from "@/components/adm/Sidebar"
import Header from "@/components/adm/Header"
import { usuarioAtual } from "@/server/auth/sessao"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await usuarioAtual()
  if (!usuario) redirect("/login")
  if (usuario.papel !== "Admin") redirect("/")

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header />
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
