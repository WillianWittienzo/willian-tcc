import { NextRequest, NextResponse } from "next/server";
import { produtoController } from "@/server/controllers/produtoController";

function obterProdutoId(id: string) {
  const produtoId = Number(id);
  return Number.isInteger(produtoId) && produtoId > 0 ? produtoId : null;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const produtoId = obterProdutoId(id);

  if (produtoId === null) {
    return NextResponse.json({ erro: "ID do produto inválido" }, { status: 400 });
  }

  const data = await request.json();
  const resultado = await produtoController.atualizar(produtoId, data);

  return NextResponse.json(resultado.data, { status: resultado.status });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const produtoId = obterProdutoId(id);

  if (produtoId === null) {
    return NextResponse.json({ erro: "ID do produto inválido" }, { status: 400 });
  }

  const resultado = await produtoController.excluir(produtoId);

  return NextResponse.json(resultado.data, { status: resultado.status });
}
