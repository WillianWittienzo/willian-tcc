import { NextRequest, NextResponse } from "next/server";
import { pedidoController } from "@/server/controllers/pedidoController";

export async function GET() {
  const resultado = await pedidoController.listarTodos();

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}

export async function POST(request: NextRequest) {
  const data: unknown = await request.json().catch(() => null);
  const resultado = await pedidoController.criar(data);

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}
