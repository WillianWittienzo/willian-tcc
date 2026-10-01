import { NextRequest, NextResponse } from "next/server";
import { produtoController } from "@/server/controllers/produtoController";


export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const produtoId = Number(id);

  if (!Number.isInteger(produtoId) || produtoId <= 0) {
    return NextResponse.json(
      { erro: "ID do produto inválido" },
      { status: 400 }
    );
  }

  const resultado = await produtoController.excluir(produtoId);

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}