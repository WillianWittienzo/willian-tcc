import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/server/services/authService";
import { COOKIE_SESSAO, opcoesCookieSessao } from "@/server/auth/sessao";

export async function POST(request: NextRequest) {
  await authService.logout(request.cookies.get(COOKIE_SESSAO)?.value);
  const response = NextResponse.json({ mensagem: "Logout realizado" });
  response.cookies.set(COOKIE_SESSAO, "", { ...opcoesCookieSessao, expires: new Date(0) });
  return response;
}
