import type { NextRequest } from "next/server";
import { usuarioDaRequisicao } from "@/server/auth/sessao";

export async function verificarAdmin(request: NextRequest) {
  const usuario = await usuarioDaRequisicao(request);
  if (!usuario) return { status: 401, erro: "Autenticação necessária" };
  if (usuario.papel !== "Admin") return { status: 403, erro: "Acesso negado" };
  return null;
}
