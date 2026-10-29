type Registro = { quantidade: number; inicio: number };

import type { NextRequest } from "next/server";

const registros = new Map<string, Registro>();

export function verificarLimiteConta(chave: string, maximo: number, janelaMs: number) {
  const agora = Date.now();
  const registro = registros.get(chave);
  if (!registro || agora - registro.inicio >= janelaMs) {
    registros.set(chave, { quantidade: 1, inicio: agora });
    return null;
  }
  if (registro.quantidade >= maximo) {
    return Math.ceil((janelaMs - (agora - registro.inicio)) / 1000);
  }
  registro.quantidade += 1;
  return null;
}

export function chaveRedeConta(request: NextRequest, acao: string) {
  const endereco = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? request.headers.get("x-real-ip")
    ?? "local";
  return `${acao}:${endereco}`;
}
