const JANELA_MS = 10 * 60 * 1000;
const MAX_TENTATIVAS = 10;

type Registro = { tentativas: number; inicio: number };
const registros = new Map<string, Registro>();

function limparExpirados(agora: number) {
  if (registros.size < 500) return;
  for (const [chave, registro] of registros) {
    if (agora - registro.inicio >= JANELA_MS) registros.delete(chave);
  }
}

export function verificarLimiteAcompanhamento(chave: string) {
  const agora = Date.now();
  limparExpirados(agora);
  const registro = registros.get(chave);
  if (!registro || agora - registro.inicio >= JANELA_MS || registro.tentativas < MAX_TENTATIVAS) {
    return null;
  }
  return Math.ceil((JANELA_MS - (agora - registro.inicio)) / 1000);
}

export function registrarTentativaAcompanhamento(chave: string) {
  const agora = Date.now();
  const registro = registros.get(chave);
  if (!registro || agora - registro.inicio >= JANELA_MS) {
    registros.set(chave, { tentativas: 1, inicio: agora });
    return;
  }
  registro.tentativas += 1;
}
