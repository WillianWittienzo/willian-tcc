import { NextRequest, NextResponse } from "next/server";
import { usuarioDaRequisicao } from "@/server/auth/sessao";

export async function GET(request: NextRequest) {
  const usuario = await usuarioDaRequisicao(request);
  if (!usuario) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  return NextResponse.json({ usuario });
}
