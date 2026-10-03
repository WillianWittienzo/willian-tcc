import { NextRequest, NextResponse } from "next/server";
import { produtoController } from "@/server/controllers/produtoController";
import { verificarAdmin } from "@/server/auth/autorizacao";

export async function GET() {
  const resultado = await produtoController.listarTodos();

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}

export async function POST(request: NextRequest) {
  const bloqueio = await verificarAdmin(request);
  if (bloqueio) return NextResponse.json({ erro: bloqueio.erro }, { status: bloqueio.status });

  const data = await request.json();
  const resultado = await produtoController.criar(data);

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}
