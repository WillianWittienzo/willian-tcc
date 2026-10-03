import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { authService } from "@/server/services/authService";

export const COOKIE_SESSAO = "brasa_quente_sessao";

export const opcoesCookieSessao = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function usuarioDaRequisicao(request: NextRequest) {
  return authService.usuarioPorToken(request.cookies.get(COOKIE_SESSAO)?.value);
}

export async function usuarioAtual() {
  const armazenamento = await cookies();
  return authService.usuarioPorToken(armazenamento.get(COOKIE_SESSAO)?.value);
}
