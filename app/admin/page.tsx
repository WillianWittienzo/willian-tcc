"use client";

import { useEffect, useState } from "react";
import CardDashboard from "@/components/adm/CardDashboard";
import { FiltrosData } from "@/components/adm/FiltrosData";
import { obterResumoDashboard, type ResumoDashboard } from "@/client/dashboardClient";
import { atualizarFuncionamento, consultarFuncionamento } from "@/client/funcionamentoClient";
import type { FiltrosDataPedido } from "@/lib/filtrosPedido";
import { DIAS_SEMANA, type SituacaoFuncionamento } from "@/lib/funcionamento";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function DashboardPage() {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [erro, setErro] = useState("");
  const [filtrosData, setFiltrosData] = useState<FiltrosDataPedido>({ dia: null, mes: null, ano: null });
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const [funcionamento, setFuncionamento] = useState<SituacaoFuncionamento | null>(null);
  const [erroFuncionamento, setErroFuncionamento] = useState("");
  const [salvandoFuncionamento, setSalvandoFuncionamento] = useState(false);

  useEffect(() => {
    let ativo = true;
    obterResumoDashboard(filtrosData)
      .then((dados) => {
        if (ativo) {
          setResumo(dados);
          setAnosDisponiveis(dados.anosDisponiveis);
          setErro("");
        }
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof Error ? error.message : "Erro ao carregar dashboard");
      });
    return () => { ativo = false; };
  }, [filtrosData]);

  useEffect(() => {
    consultarFuncionamento()
      .then((dados) => {
        setFuncionamento(dados);
        setErroFuncionamento("");
      })
      .catch((error) => setErroFuncionamento(
        error instanceof Error ? error.message : "Erro ao carregar funcionamento",
      ));
  }, []);

  async function persistirFuncionamento(configuracao: SituacaoFuncionamento) {
    if (salvandoFuncionamento) return;
    setSalvandoFuncionamento(true);
    setErroFuncionamento("");
    try {
      setFuncionamento(await atualizarFuncionamento(configuracao));
    } catch (error) {
      setErroFuncionamento(error instanceof Error ? error.message : "Erro ao salvar funcionamento");
    } finally {
      setSalvandoFuncionamento(false);
    }
  }

  async function alterarFechamentoManual(fechamentoManual: boolean) {
    if (!funcionamento || salvandoFuncionamento) return;
    await persistirFuncionamento({ ...funcionamento, fechamentoManual });
  }

  async function salvarFuncionamento() {
    if (!funcionamento || salvandoFuncionamento) return;
    await persistirFuncionamento(funcionamento);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold">DASHBOARD</h2>
        <FiltrosData
          filtros={filtrosData}
          anosDisponiveis={anosDisponiveis}
          onChange={(novosFiltros) => {
            setResumo(null);
            setErro("");
            setFiltrosData(novosFiltros);
          }}
        />
      </div>
      {erro && <p className="mb-4 rounded bg-red-100 p-3 text-red-800">{erro}</p>}
      {!resumo && !erro && <p className="text-gray-500">Carregando...</p>}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CardDashboard title="Total de Pedidos" value={String(resumo.totalPedidos)} />
          <CardDashboard title="Receita Total" value={moeda.format(resumo.receita)} />
          <CardDashboard title="Clientes" value={String(resumo.clientes)} />
          <CardDashboard title="Produtos cadastrados" value={String(resumo.produtos)} />
          <CardDashboard title="Recebimentos pendentes" value={String(resumo.recebimentosPendentes)} />
          <CardDashboard title="Valor recebido" value={moeda.format(resumo.valorRecebido)} />
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500">Receita considera pedidos não cancelados; valor recebido considera somente recebimentos marcados como Pago.</p>

      <section className="mt-8 rounded-xl bg-white p-5 shadow">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Horário de funcionamento</h2>
            <p className="mt-1 text-sm text-gray-500">Fuso horário: America/Sao_Paulo. Horários iguais representam funcionamento por 24 horas.</p>
          </div>
          {funcionamento && (
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${funcionamento.aberto ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {funcionamento.aberto ? "Aberta agora" : "Fechada agora"}
            </span>
          )}
        </div>

        {erroFuncionamento && <p className="mt-4 rounded bg-red-100 p-3 text-red-800" role="alert">{erroFuncionamento}</p>}
        {!funcionamento && !erroFuncionamento && <p className="mt-4 text-gray-500">Carregando horários...</p>}

        {funcionamento && (
          <div className="mt-5 space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 font-semibold">
              <span>
                Fechamento manual temporário
                <small className="mt-1 block font-normal text-gray-600">Impede novos pedidos até ser desativado.</small>
              </span>
              <input
                type="checkbox"
                checked={funcionamento.fechamentoManual}
                disabled={salvandoFuncionamento}
                onChange={(event) => void alterarFechamentoManual(event.target.checked)}
                className="h-5 w-5 accent-red-700"
              />
            </label>

            <div className="space-y-2">
              {DIAS_SEMANA.map((dia) => {
                const horario = funcionamento.horarios.find((item) => item.diaSemana === dia.valor)!;
                const alterarHorario = (dados: Partial<typeof horario>) => setFuncionamento({
                  ...funcionamento,
                  horarios: funcionamento.horarios.map((item) => item.diaSemana === dia.valor ? { ...item, ...dados } : item),
                });
                return (
                  <div key={dia.valor} className="grid items-center gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(150px,1fr)_auto_130px_20px_130px]">
                    <span className="font-semibold">{dia.rotulo}</span>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={horario.fechado} disabled={salvandoFuncionamento} onChange={(event) => alterarHorario({ fechado: event.target.checked })} className="accent-red-700" />
                      Fechado
                    </label>
                    <input aria-label={`Abertura de ${dia.rotulo}`} type="time" value={horario.abertura} disabled={horario.fechado || salvandoFuncionamento} onChange={(event) => alterarHorario({ abertura: event.target.value })} className="rounded-md border p-2 disabled:bg-gray-100" />
                    <span className="text-center text-gray-500">até</span>
                    <input aria-label={`Fechamento de ${dia.rotulo}`} type="time" value={horario.fechamento} disabled={horario.fechado || salvandoFuncionamento} onChange={(event) => alterarHorario({ fechamento: event.target.value })} className="rounded-md border p-2 disabled:bg-gray-100" />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">{funcionamento.mensagem}</p>
              <button type="button" onClick={() => void salvarFuncionamento()} disabled={salvandoFuncionamento} className="rounded-md bg-red-700 px-5 py-2 font-semibold text-white hover:bg-red-800 disabled:opacity-50">
                {salvandoFuncionamento ? "Salvando..." : "Salvar horários"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
