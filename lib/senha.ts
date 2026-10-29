const SENHAS_COMUNS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password123",
  "qwerty123",
  "senha123",
  "senha1234",
  "admin123",
  "brasaquente",
  "brasa123",
]);

export function erroSenhaForte(senha: string) {
  if (senha.length < 8) return "A senha deve ter no mínimo 8 caracteres";
  if (senha.length > 128) return "A senha deve ter no máximo 128 caracteres";

  const normalizada = senha.trim().toLowerCase();
  if (SENHAS_COMUNS.has(normalizada) || /^(.)\1{7,}$/.test(normalizada)) {
    return "Escolha uma senha menos comum e previsível";
  }
  return null;
}
