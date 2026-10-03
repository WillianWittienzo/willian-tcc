import { NextRequest, NextResponse } from "next/server";
import { usuarioDaRequisicao } from "@/server/auth/sessao";
import { pedidoController } from "@/server/controllers/pedidoController";

export async function GET(request: NextRequest) {
  const usuario = await usuarioDaRequisicao(request);
  if (!usuario) {
    return NextResponse.json({ erro: "Autenticação necessária" }, { status: 401 });
  }

  const resultado = await pedidoController.listarDoCliente(usuario.id);
  return NextResponse.json(resultado.data, { status: resultado.status });
}
