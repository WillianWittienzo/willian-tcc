import { NextRequest, NextResponse } from "next/server";
import { produtoController } from "@/server/controllers/produtoController";
import { verificarAdmin } from "@/server/auth/autorizacao";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";

function obterProdutoId(id: string) {
  const produtoId = Number(id);
  return Number.isInteger(produtoId) && produtoId > 0 ? produtoId : null;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }
  const bloqueio = await verificarAdmin(request);
  if (bloqueio) return NextResponse.json({ erro: bloqueio.erro }, { status: bloqueio.status });

  const { id } = await context.params;
  const produtoId = obterProdutoId(id);

  if (produtoId === null) {
    return NextResponse.json({ erro: "ID do produto inválido" }, { status: 400 });
  }

  const data: unknown = await request.json().catch(() => null);
  const resultado = await produtoController.atualizar(produtoId, data);

  return NextResponse.json(resultado.data, { status: resultado.status });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }
  const bloqueio = await verificarAdmin(request);
  if (bloqueio) return NextResponse.json({ erro: bloqueio.erro }, { status: bloqueio.status });

  const { id } = await context.params;
  const produtoId = obterProdutoId(id);

  if (produtoId === null) {
    return NextResponse.json({ erro: "ID do produto inválido" }, { status: 400 });
  }

  const resultado = await produtoController.excluir(produtoId);

  return NextResponse.json(resultado.data, { status: resultado.status });
}
