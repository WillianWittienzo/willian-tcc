import { NextRequest, NextResponse } from "next/server";
import { authController } from "@/server/controllers/authController";

export async function POST(request: NextRequest) {
  const resultado = await authController.cadastrar(await request.json().catch(() => null));
  return NextResponse.json(resultado.data, { status: resultado.status });
}
