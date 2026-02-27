export default function Header() {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">
        Painel Administrativo
      </h1>

      <span className="text-sm text-gray-600">
        Olá, Administrador
      </span>
    </header>
  )
}