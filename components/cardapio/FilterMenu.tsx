type FilterMenuProps = {
  categoriaAtiva: string
  setCategoriaAtiva: (categoria: string) => void
}

export function FilterMenu({ categoriaAtiva, setCategoriaAtiva }: FilterMenuProps) {

  const categorias = ["Todas", "Tradicional", "Especial", "Doce"]

  return (
    <div className="flex gap-4 mb-8">
      {categorias.map((categoria) => (
        <button
          key={categoria}
          onClick={() => setCategoriaAtiva(categoria)}
          className={`px-4 py-2 rounded-full border transition
            ${categoriaAtiva === categoria 
              ? "bg-red-800 text-white" 
              : "bg-white text-black"}
          `}
        >
          {categoria}
        </button>
      ))}
    </div>
  )
}
