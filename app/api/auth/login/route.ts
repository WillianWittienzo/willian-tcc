import { NextRequest, NextResponse } from "next/server";
import { authController } from "@/server/controllers/authController";
import { COOKIE_SESSAO, opcoesCookieSessao } from "@/server/auth/sessao";

export async function POST(request: NextRequest) {
  const resultado = await authController.login(await request.json().catch(() => null));
  const response = NextResponse.json(resultado.data, { status: resultado.status });

  if (resultado.status === 200 && "sessao" in resultado) {
    response.cookies.set(COOKIE_SESSAO, resultado.sessao.token, {
      ...opcoesCookieSessao,
      expires: resultado.sessao.expiraEm,
    });
  }

  return response;
}
