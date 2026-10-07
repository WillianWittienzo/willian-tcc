import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ erro: "Cadastro público desativado" }, { status: 404 });
}
