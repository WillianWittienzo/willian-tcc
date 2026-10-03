import { redirect } from "next/navigation"
import Sidebar from "@/components/adm/Sidebar"
import Header from "@/components/layout/Header"
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
