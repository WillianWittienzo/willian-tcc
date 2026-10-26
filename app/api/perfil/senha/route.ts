import { NextRequest, NextResponse } from "next/server";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";
import { COOKIE_SESSAO, usuarioDaRequisicao } from "@/server/auth/sessao";
import { authController } from "@/server/controllers/authController";

export async function PATCH(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }
  const tokenAtual = request.cookies.get(COOKIE_SESSAO)?.value;
  const usuario = await usuarioDaRequisicao(request);
  if (!usuario || !tokenAtual) {
    return NextResponse.json({ erro: "Autenticação necessária" }, { status: 401 });
  }
  if (usuario.papel !== "Cliente") {
    return NextResponse.json({ erro: "Acesso disponível somente para clientes" }, { status: 403 });
  }

  const resultado = await authController.alterarSenha(
    usuario.id,
    tokenAtual,
    await request.json().catch(() => null),
  );
  return NextResponse.json(resultado.data, { status: resultado.status });
}
