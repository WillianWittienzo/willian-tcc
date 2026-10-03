import { NextRequest, NextResponse } from "next/server";
import { pedidoController } from "@/server/controllers/pedidoController";
import { verificarAdmin } from "@/server/auth/autorizacao";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const bloqueio = await verificarAdmin(request);
  if (bloqueio) return NextResponse.json({ erro: bloqueio.erro }, { status: bloqueio.status });

  const { id } = await context.params;
  const data: unknown = await request.json().catch(() => null);
  const resultado = await pedidoController.atualizarStatus(Number(id), data);

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}
