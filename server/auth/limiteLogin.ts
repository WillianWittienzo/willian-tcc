const JANELA_MS = 15 * 60 * 1000;
const MAX_TENTATIVAS = 5;

type Registro = { tentativas: number; inicio: number };
const tentativas = new Map<string, Registro>();

function limparExpirados(agora: number) {
  if (tentativas.size < 500) return;
  for (const [chave, registro] of tentativas) {
    if (agora - registro.inicio >= JANELA_MS) tentativas.delete(chave);
  }
}

export function verificarLimiteLogin(chave: string) {
  const agora = Date.now();
  limparExpirados(agora);
  const registro = tentativas.get(chave);
  if (!registro || agora - registro.inicio >= JANELA_MS) return null;
  if (registro.tentativas < MAX_TENTATIVAS) return null;
  return Math.ceil((JANELA_MS - (agora - registro.inicio)) / 1000);
}

export function registrarFalhaLogin(chave: string) {
  const agora = Date.now();
  const registro = tentativas.get(chave);
  if (!registro || agora - registro.inicio >= JANELA_MS) {
    tentativas.set(chave, { tentativas: 1, inicio: agora });
    return;
  }
  registro.tentativas += 1;
}

export function limparFalhasLogin(chave: string) {
  tentativas.delete(chave);
}
