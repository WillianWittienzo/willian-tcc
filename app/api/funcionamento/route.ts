import { NextRequest, NextResponse } from "next/server";
import { funcionamentoController } from "@/server/controllers/funcionamentoController";
import { verificarAdmin } from "@/server/auth/autorizacao";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";

export async function GET() {
  const resultado = await funcionamentoController.consultar();
  return NextResponse.json(resultado.data, { status: resultado.status });
}

export async function PUT(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }
  const bloqueio = await verificarAdmin(request);
  if (bloqueio) return NextResponse.json({ erro: bloqueio.erro }, { status: bloqueio.status });
  const data: unknown = await request.json().catch(() => null);
  const resultado = await funcionamentoController.atualizar(data);
  return NextResponse.json(resultado.data, { status: resultado.status });
}
