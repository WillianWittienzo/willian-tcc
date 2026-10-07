"use client"

import Link from "next/link"
import { LayoutDashboard, ShoppingCart, Pizza, LogOut } from "lucide-react"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"


export default function Sidebar() {
  const { logout } = useAuth()
  const router = useRouter()

  async function sair() {
    await logout()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="flex w-full flex-col justify-between bg-red-700 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
      
      <div>
        <div className="border-b border-red-600 p-4 text-lg font-bold lg:p-6 lg:text-xl">
          🍕 BRASA QUENTE
        </div>

        <nav className="flex flex-wrap gap-2 p-3 lg:flex-col lg:p-4">
          <Link href="/admin" className="flex items-center gap-2 p-2 rounded hover:bg-red-600">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link href="/admin/pedidos" className="flex items-center gap-2 p-2 rounded hover:bg-red-600">
            <ShoppingCart size={18} />
            Pedidos
          </Link>

          <Link href="/admin/produtos" className="flex items-center gap-2 p-2 rounded hover:bg-red-600">
            <Pizza size={18} />
            Produtos
          </Link>

        </nav>
      </div>

      <div className="border-t border-red-600 p-4">

        <button onClick={sair} className="flex items-center gap-2 w-full hover:text-gray-200">
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
