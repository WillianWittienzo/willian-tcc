import { NextRequest, NextResponse } from "next/server";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";
import { usuarioDaRequisicao } from "@/server/auth/sessao";
import { pedidoController } from "@/server/controllers/pedidoController";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }

  const usuario = await usuarioDaRequisicao(request);
  if (!usuario) {
    return NextResponse.json({ erro: "Autenticação necessária" }, { status: 401 });
  }
  if (usuario.papel !== "Cliente") {
    return NextResponse.json({ erro: "Acesso disponível somente para clientes" }, { status: 403 });
  }

  const { id } = await context.params;
  const resultado = await pedidoController.cancelarDoCliente(Number(id), usuario.id);
  return NextResponse.json(resultado.data, { status: resultado.status });
}
