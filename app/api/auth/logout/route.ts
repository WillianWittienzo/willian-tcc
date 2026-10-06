import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/server/services/authService";
import { COOKIE_SESSAO, opcoesCookieSessao } from "@/server/auth/sessao";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";

export async function POST(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }
  await authService.logout(request.cookies.get(COOKIE_SESSAO)?.value);
  const response = NextResponse.json({ mensagem: "Logout realizado" });
  response.cookies.set(COOKIE_SESSAO, "", { ...opcoesCookieSessao, expires: new Date(0) });
  return response;
}
