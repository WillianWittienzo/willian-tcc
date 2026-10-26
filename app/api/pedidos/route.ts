import { NextRequest, NextResponse } from "next/server";
import { pedidoController } from "@/server/controllers/pedidoController";
import { verificarAdmin } from "@/server/auth/autorizacao";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";
import { registrarTentativaPedido, verificarLimitePedido } from "@/server/auth/limitePedido";
import { usuarioDaRequisicao } from "@/server/auth/sessao";

export async function GET(request: NextRequest) {
  const bloqueio = await verificarAdmin(request);
  if (bloqueio) return NextResponse.json({ erro: bloqueio.erro }, { status: bloqueio.status });

  const parametros = Object.fromEntries(request.nextUrl.searchParams.entries());
  const resultado = parametros.visualizacao === "kanban"
    ? await pedidoController.listarKanban(parametros)
    : await pedidoController.listarTodos(parametros);

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}

export async function POST(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }
  const chave = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? request.headers.get("x-real-ip")
    ?? "local";
  const aguarde = verificarLimitePedido(chave);
  if (aguarde !== null) {
    return NextResponse.json(
      { erro: "Muitos pedidos em pouco tempo. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(aguarde) } },
    );
  }
  registrarTentativaPedido(chave);

  const data: unknown = await request.json().catch(() => null);
  const usuario = await usuarioDaRequisicao(request);
  const clienteId = usuario?.papel === "Cliente" ? usuario.id : null;
  const resultado = await pedidoController.criar(data, clienteId);

  return NextResponse.json(resultado.data, {
    status: resultado.status,
  });
}
