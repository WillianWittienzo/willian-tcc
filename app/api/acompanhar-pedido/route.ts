import { NextRequest, NextResponse } from "next/server";
import { pedidoController } from "@/server/controllers/pedidoController";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";
import {
  registrarTentativaAcompanhamento,
  verificarLimiteAcompanhamento,
} from "@/server/auth/limiteAcompanhamento";

export async function POST(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) {
    return NextResponse.json({ erro: "Origem da requisição não permitida" }, { status: 403 });
  }
  const chave = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? request.headers.get("x-real-ip")
    ?? "local";
  const aguarde = verificarLimiteAcompanhamento(chave);
  if (aguarde !== null) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(aguarde) } },
    );
  }
  registrarTentativaAcompanhamento(chave);
  const data: unknown = await request.json().catch(() => null);
  const resultado = await pedidoController.acompanhar(data);
  return NextResponse.json(resultado.data, { status: resultado.status });
}
