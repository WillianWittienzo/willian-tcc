import { NextRequest, NextResponse } from "next/server";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";
import { usuarioDaRequisicao } from "@/server/auth/sessao";
import { verificarLimiteConta } from "@/server/auth/limiteConta";
import { authController } from "@/server/controllers/authController";

export async function POST(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) return NextResponse.json({ erro: "Origem não permitida" }, { status: 403 });
  const usuario = await usuarioDaRequisicao(request);
  if (!usuario) return NextResponse.json({ erro: "Autenticação necessária" }, { status: 401 });
  if (usuario.papel !== "Cliente") return NextResponse.json({ erro: "Disponível somente para clientes" }, { status: 403 });
  const aguarde = verificarLimiteConta(`reenviar-email:${usuario.id}`, 3, 60 * 60 * 1000);
  if (aguarde !== null) {
    return NextResponse.json({ erro: "Aguarde antes de solicitar outro envio." }, { status: 429, headers: { "Retry-After": String(aguarde) } });
  }
  const resultado = await authController.reenviarVerificacaoEmail(usuario.id);
  return NextResponse.json(resultado.data, { status: resultado.status });
}
