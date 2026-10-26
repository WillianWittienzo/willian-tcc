import { NextRequest, NextResponse } from "next/server";
import { usuarioDaRequisicao } from "@/server/auth/sessao";
import { authController } from "@/server/controllers/authController";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";

export async function GET(request: NextRequest) {
  const usuario = await usuarioDaRequisicao(request);
  if (!usuario) return NextResponse.json({ erro: "Autenticação necessária" }, { status: 401 });
  if (usuario.papel !== "Cliente") {
    return NextResponse.json({ erro: "Acesso disponível somente para clientes" }, { status: 403 });
  }

  const resultado = await authController.perfil(usuario.id);
  return NextResponse.json(resultado.data, { status: resultado.status });
}

export async function PATCH(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }
  const usuario = await usuarioDaRequisicao(request);
  if (!usuario) return NextResponse.json({ erro: "Autenticação necessária" }, { status: 401 });
  if (usuario.papel !== "Cliente") {
    return NextResponse.json({ erro: "Acesso disponível somente para clientes" }, { status: 403 });
  }

  const resultado = await authController.atualizarDadosPessoais(
    usuario.id,
    await request.json().catch(() => null),
  );
  return NextResponse.json(resultado.data, { status: resultado.status });
}
