import assert from "node:assert/strict";
import test from "node:test";
import {
  AuthCredenciaisInvalidasError,
  AuthDadosInvalidosError,
  gerarHashSenha,
  validarAlteracaoSenha,
  validarCadastro,
  validarDadosPessoais,
  validarLogin,
  verificarSenha,
} from "../server/services/authService";

test("normaliza os dados obrigatórios do cadastro de cliente", () => {
  assert.deepEqual(validarCadastro({
    nome: "  Maria   da Silva  ",
    email: "  MARIA@EXEMPLO.COM ",
    telefone: "+55 (11) 99999-9999",
    senha: "senha-segura",
  }), {
    nome: "Maria da Silva",
    email: "maria@exemplo.com",
    telefone: "11999999999",
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
    papel: "Admin",
  }), { nome: "Maria Atualizada", telefone: "11988887777" });
  assert.throws(() => validarDadosPessoais({ nome: "M", telefone: "123" }), AuthDadosInvalidosError);
});

test("rejeita dados inválidos no cadastro de cliente", () => {
  const valido = {
    nome: "Maria da Silva",
    email: "maria@exemplo.com",
    telefone: "11999999999",
    senha: "senha-segura",
  };
  const invalidos = [
    { ...valido, nome: "M" },
    { ...valido, email: "email-invalido" },
    { ...valido, telefone: "123" },
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
