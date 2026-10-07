import { MESES, type FiltrosDataPedido } from "@/lib/filtrosPedido";

type FiltrosDataProps = {
  filtros: FiltrosDataPedido;
  anosDisponiveis: number[];
  onChange: (filtros: FiltrosDataPedido) => void;
};

export function FiltrosData({ filtros, anosDisponiveis, onChange }: FiltrosDataProps) {
  const quantidadeDias = filtros.ano !== null && filtros.mes !== null
    ? new Date(filtros.ano, filtros.mes, 0).getDate()
    : 31;

  return (
    <div className="flex flex-wrap gap-3">
      <label className="text-sm font-semibold">
        Dia
        <select
          value={filtros.dia ?? ""}
          disabled={filtros.mes === null || filtros.ano === null}
          onChange={(event) => onChange({
            ...filtros,
            dia: event.target.value ? Number(event.target.value) : null,
          })}
          className="ml-2 rounded-md border bg-white px-3 py-2 font-normal disabled:bg-gray-100"
        >
          <option value="">Todos</option>
          {Array.from({ length: quantidadeDias }, (_, indice) => indice + 1).map((dia) => (
            <option key={dia} value={dia}>{String(dia).padStart(2, "0")}</option>
          ))}
        </select>
      </label>

      <label className="text-sm font-semibold">
        Mês
        <select
          value={filtros.mes ?? ""}
          disabled={filtros.ano === null}
          onChange={(event) => onChange({
            ...filtros,
            mes: event.target.value ? Number(event.target.value) : null,
            dia: null,
          })}
          className="ml-2 rounded-md border bg-white px-3 py-2 font-normal disabled:bg-gray-100"
        >
          <option value="">Todos</option>
          {MESES.map((mes, indice) => (
            <option key={mes} value={indice + 1}>{mes}</option>
          ))}
        </select>
      </label>

      <label className="text-sm font-semibold">
        Ano
        <select
          value={filtros.ano ?? ""}
          onChange={(event) => {
            const ano = event.target.value ? Number(event.target.value) : null;
            onChange({ ano, mes: ano === null ? null : filtros.mes, dia: ano === null ? null : filtros.dia });
          }}
          className="ml-2 rounded-md border bg-white px-3 py-2 font-normal"
        >
          <option value="">Todos</option>
          {anosDisponiveis.map((ano) => <option key={ano} value={ano}>{ano}</option>)}
        </select>
      </label>
    </div>
  );
}
