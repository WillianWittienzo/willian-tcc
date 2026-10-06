import { NextRequest, NextResponse } from "next/server";
import { authController } from "@/server/controllers/authController";
import { COOKIE_SESSAO, opcoesCookieSessao } from "@/server/auth/sessao";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";
import { limparFalhasLogin, registrarFalhaLogin, verificarLimiteLogin } from "@/server/auth/limiteLogin";

export async function POST(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }
  const chave = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? request.headers.get("x-real-ip")
    ?? "local";
  const aguarde = verificarLimiteLogin(chave);
  if (aguarde !== null) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(aguarde) } }
    );
  }
  const resultado = await authController.login(await request.json().catch(() => null));
  const response = NextResponse.json(resultado.data, { status: resultado.status });

  if (resultado.status === 200 && "sessao" in resultado) {
    limparFalhasLogin(chave);
    response.cookies.set(COOKIE_SESSAO, resultado.sessao.token, {
      ...opcoesCookieSessao,
      expires: resultado.sessao.expiraEm,
    });
  } else if (resultado.status === 400) {
    registrarFalhaLogin(chave);
  }

  return response;
}
