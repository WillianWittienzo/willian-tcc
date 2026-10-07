import { NextRequest, NextResponse } from "next/server";
import { verificarAdmin } from "@/server/auth/autorizacao";
import { dashboardController } from "@/server/controllers/dashboardController";

export async function GET(request: NextRequest) {
  const bloqueio = await verificarAdmin(request);
  if (bloqueio) return NextResponse.json({ erro: bloqueio.erro }, { status: bloqueio.status });
  const resultado = await dashboardController.obterResumo(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );
  return NextResponse.json(resultado.data, { status: resultado.status });
}
