import { NextRequest, NextResponse } from "next/server";
import { chaveRedeConta, verificarLimiteConta } from "@/server/auth/limiteConta";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";
import { authController } from "@/server/controllers/authController";

export async function POST(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) return NextResponse.json({ erro: "Origem não permitida" }, { status: 403 });
  const aguarde = verificarLimiteConta(chaveRedeConta(request, "recuperar-senha"), 5, 60 * 60 * 1000);
  if (aguarde !== null) return NextResponse.json({ erro: "Muitas solicitações. Tente novamente depois." }, { status: 429, headers: { "Retry-After": String(aguarde) } });
  const resultado = await authController.solicitarRecuperacaoSenha(await request.json().catch(() => null));
  return NextResponse.json(resultado.data, { status: resultado.status });
}
