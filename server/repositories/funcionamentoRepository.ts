import { prisma } from "@/lib/prisma";

const HORARIOS_PADRAO = Array.from({ length: 7 }, (_, diaSemana) => ({
  diaSemana,
  fechado: false,
  abertura: "00:00",
  fechamento: "00:00",
}));

export const funcionamentoRepository = {
  async buscar() {
    await prisma.$transaction([
      prisma.configuracaoFuncionamento.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1 },
      }),
      ...HORARIOS_PADRAO.map((horario) => prisma.horarioFuncionamento.upsert({
        where: { diaSemana: horario.diaSemana },
        update: {},
        create: horario,
      })),
    ]);
    const [configuracao, horarios] = await Promise.all([
      prisma.configuracaoFuncionamento.findUniqueOrThrow({ where: { id: 1 } }),
      prisma.horarioFuncionamento.findMany({ orderBy: { diaSemana: "asc" } }),
    ]);
    return { configuracao, horarios };
  },

  async atualizar(data: {
    fechamentoManual: boolean;
    horarios: { diaSemana: number; fechado: boolean; abertura: string; fechamento: string }[];
  }) {
    await prisma.$transaction([
      prisma.configuracaoFuncionamento.upsert({
        where: { id: 1 },
        update: { fechamentoManual: data.fechamentoManual },
        create: { id: 1, fechamentoManual: data.fechamentoManual },
      }),
      ...data.horarios.map((horario) => prisma.horarioFuncionamento.upsert({
        where: { diaSemana: horario.diaSemana },
        update: horario,
        create: horario,
      })),
    ]);
    return this.buscar();
  },
};
