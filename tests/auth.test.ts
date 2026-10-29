import assert from "node:assert/strict";
import test from "node:test";
import {
  AuthCredenciaisInvalidasError,
  AuthDadosInvalidosError,
  gerarHashSenha,
  hashTokenSessao,
  validarAlteracaoSenha,
  validarCadastro,
  validarDadosPessoais,
  validarLogin,
  verificarSenha,
} from "../server/services/authService";
import { cpfValido, formatarCpf, somenteDigitosCpf } from "../lib/cpf";
import { erroSenhaForte } from "../lib/senha";
import { verificarLimiteConta } from "../server/auth/limiteConta";

test("hash de token e limite de solicitações não expõem o token original", () => {
  const token = "token-secreto-de-teste";
  const hash = hashTokenSessao(token);
  assert.equal(hash.length, 64);
  assert.equal(hash.includes(token), false);
  const chave = `teste-${Date.now()}`;
  assert.equal(verificarLimiteConta(chave, 2, 60_000), null);
  assert.equal(verificarLimiteConta(chave, 2, 60_000), null);
  assert.ok((verificarLimiteConta(chave, 2, 60_000) ?? 0) > 0);
});

test("exige senha longa e rejeita senhas comuns sem impor composição fixa", () => {
  assert.equal(erroSenhaForte("curta"), "A senha deve ter no mínimo 8 caracteres");
  assert.equal(erroSenhaForte("12345678"), "Escolha uma senha menos comum e previsível");
  assert.equal(erroSenhaForte("aaaaaaaa"), "Escolha uma senha menos comum e previsível");
  assert.equal(erroSenhaForte("uma frase longa e segura para minha conta"), null);
  assert.equal(erroSenhaForte("segura!2026"), null);
});

test("valida e formata CPF matematicamente", () => {
  assert.equal(cpfValido("529.982.247-25"), true);
  assert.equal(cpfValido("52998224725"), true);
  assert.equal(cpfValido("529.982.247-24"), false);
  assert.equal(cpfValido("111.111.111-11"), false);
  assert.equal(cpfValido("123"), false);
  assert.equal(somenteDigitosCpf("529.982.247-25"), "52998224725");
  assert.equal(formatarCpf("52998224725"), "529.982.247-25");
});

test("normaliza os dados obrigatórios do cadastro de cliente", () => {
  assert.deepEqual(validarCadastro({
    nome: "  Maria   da Silva  ",
    email: "  MARIA@EXEMPLO.COM ",
    telefone: "+55 (11) 99999-9999",
    cpf: "529.982.247-25",
    senha: "senha-segura",
  }), {
    nome: "Maria da Silva",
    email: "maria@exemplo.com",
    telefone: "11999999999",
    cpf: "52998224725",
    senha: "senha-segura",
  });
});

test("valida alteração de senha e confirmação", () => {
  assert.deepEqual(validarAlteracaoSenha({
    senhaAtual: "senha-antiga",
    novaSenha: "senha-nova-segura",
    confirmarNovaSenha: "senha-nova-segura",
  }), { senhaAtual: "senha-antiga", novaSenha: "senha-nova-segura" });
  assert.throws(() => validarAlteracaoSenha({
    senhaAtual: "senha-antiga",
    novaSenha: "senha-nova-segura",
    confirmarNovaSenha: "diferente",
  }), AuthDadosInvalidosError);
});

test("valida atualização de nome e telefone sem aceitar outros dados", () => {
  assert.deepEqual(validarDadosPessoais({
    nome: "  Maria   Atualizada ",
    telefone: "+55 (11) 98888-7777",
    cpf: "529.982.247-25",
    papel: "Admin",
  }), { nome: "Maria Atualizada", telefone: "11988887777", cpf: "52998224725" });
  assert.throws(() => validarDadosPessoais({ nome: "M", telefone: "123" }), AuthDadosInvalidosError);
});

test("rejeita dados inválidos no cadastro de cliente", () => {
  const valido = {
    nome: "Maria da Silva",
    email: "maria@exemplo.com",
    telefone: "11999999999",
    cpf: "52998224725",
    senha: "senha-segura",
  };
  const invalidos = [
    { ...valido, nome: "M" },
    { ...valido, email: "email-invalido" },
    { ...valido, telefone: "123" },
    { ...valido, cpf: "11111111111" },
    { ...valido, senha: "curta" },
    { ...valido, senha: "x".repeat(129) },
  ];

  for (const dados of invalidos) {
    assert.throws(() => validarCadastro(dados), AuthDadosInvalidosError);
  }
});

test("normaliza o e-mail do login e limita as credenciais", () => {
  assert.deepEqual(validarLogin({ email: " ADMIN@EXEMPLO.COM ", senha: "senha-segura" }), {
    email: "admin@exemplo.com",
    senha: "senha-segura",
  });
  assert.throws(
    () => validarLogin({ email: "admin@exemplo.com", senha: "x".repeat(129) }),
    AuthCredenciaisInvalidasError,
  );
});

test("armazena senha com scrypt, salt aleatório e comparação segura", async () => {
  const primeiroHash = await gerarHashSenha("senha-segura");
  const segundoHash = await gerarHashSenha("senha-segura");

  assert.notEqual(primeiroHash, segundoHash);
  assert.equal(primeiroHash.includes("senha-segura"), false);
  assert.equal(await verificarSenha("senha-segura", primeiroHash), true);
  assert.equal(await verificarSenha("senha-incorreta", primeiroHash), false);
  assert.equal(await verificarSenha("senha-segura", "hash-inválido"), false);
});
