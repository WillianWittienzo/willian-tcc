"use client"

import Link from "next/link"
import { LayoutDashboard, ShoppingCart, Pizza, BarChart3, LogOut } from "lucide-react"


export default function Sidebar() {
  return (
    <aside className="w-64 bg-red-700 text-white flex flex-col justify-between">
      
      <div>
        <div className="p-6 text-xl font-bold border-b border-red-600">
          🍕 BRASA QUENTE
        </div>

        <nav className="flex flex-col p-4 gap-2">
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

          <Link href="/admin/relatorios" className="flex items-center gap-2 p-2 rounded hover:bg-red-600">
            <BarChart3 size={18} />
            Relatórios
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-red-600">

        <Link href="/" className="flex items-center gap-2 w-full hover:text-gray-200">
        <LogOut size={18} />
          Sair
          </Link>
      </div>
    </aside>
  )
}