import { NextRequest, NextResponse } from "next/server";
import { pedidoController } from "@/server/controllers/pedidoController";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data: unknown = await request.json().catch(() => null);
  const resultado = await pedidoController.atualizarStatus(Number(id), data);

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}
