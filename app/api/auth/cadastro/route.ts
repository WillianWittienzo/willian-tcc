import { NextRequest, NextResponse } from "next/server";
import { authController } from "@/server/controllers/authController";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";

export async function POST(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }
  const resultado = await authController.cadastrar(await request.json().catch(() => null));
  return NextResponse.json(resultado.data, { status: resultado.status });
}
