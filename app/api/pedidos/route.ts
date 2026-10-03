import { NextRequest, NextResponse } from "next/server";
import { pedidoController } from "@/server/controllers/pedidoController";
import { usuarioDaRequisicao } from "@/server/auth/sessao";
import { verificarAdmin } from "@/server/auth/autorizacao";

export async function GET(request: NextRequest) {
  const bloqueio = await verificarAdmin(request);
  if (bloqueio) return NextResponse.json({ erro: bloqueio.erro }, { status: bloqueio.status });

  const resultado = await pedidoController.listarTodos();

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}

export async function POST(request: NextRequest) {
  const usuario = await usuarioDaRequisicao(request);
  if (!usuario) {
    return NextResponse.json({ erro: "Autenticação necessária" }, { status: 401 });
  }

  const data: unknown = await request.json().catch(() => null);
  const resultado = await pedidoController.criar(usuario.id, data);

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}
