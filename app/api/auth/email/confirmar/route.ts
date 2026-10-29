import { NextRequest, NextResponse } from "next/server";
import { chaveRedeConta, verificarLimiteConta } from "@/server/auth/limiteConta";
import { requisicaoDeMesmaOrigem } from "@/server/auth/origem";
import { authController } from "@/server/controllers/authController";

export async function POST(request: NextRequest) {
  if (!requisicaoDeMesmaOrigem(request)) return NextResponse.json({ erro: "Origem não permitida" }, { status: 403 });
  const aguarde = verificarLimiteConta(chaveRedeConta(request, "confirmar-email"), 20, 10 * 60 * 1000);
  if (aguarde !== null) return NextResponse.json({ erro: "Muitas tentativas. Tente novamente depois." }, { status: 429, headers: { "Retry-After": String(aguarde) } });
  const resultado = await authController.confirmarEmail(await request.json().catch(() => null));
  return NextResponse.json(resultado.data, { status: resultado.status });
}
