import type { MetodoEntrega } from "@/lib/pedido";

export const METODOS_ENTREGA = ["Entrega", "Retirada"] as const;
export const FORMAS_PAGAMENTO = ["Dinheiro", "Cartão", "Pix", "Boleto"] as const;

export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

export type DadosCheckout = {
  nomeCliente: string;
  telefone: string;
  metodoEntrega: MetodoEntrega;
  formaPagamento: FormaPagamento;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  referencia: string | null;
};

export type DadosEntrega = DadosCheckout;

export class DadosEntregaInvalidosError extends Error {}

function lerTexto(
  data: Record<string, unknown>,
  campo: string,
  rotulo: string,
  minimo: number,
  maximo: number,
  obrigatorio = true,
) {
  const recebido = data[campo];
  if (recebido === undefined || recebido === null || recebido === "") {
    if (!obrigatorio) return null;
    throw new DadosEntregaInvalidosError(`${rotulo} é obrigatório`);
  }
  if (typeof recebido !== "string" || recebido.length > maximo) {
    throw new DadosEntregaInvalidosError(`${rotulo} deve ter no máximo ${maximo} caracteres`);
  }
  const normalizado = recebido.trim().replace(/\s+/g, " ");
  if (!normalizado && !obrigatorio) return null;
  if (normalizado.length < minimo || normalizado.length > maximo) {
    throw new DadosEntregaInvalidosError(
      obrigatorio
        ? `${rotulo} deve ter entre ${minimo} e ${maximo} caracteres`
        : `${rotulo} deve ter no máximo ${maximo} caracteres`,
    );
  }
  return normalizado;
}

export function normalizarTelefone(valor: unknown) {
  if (typeof valor !== "string" || valor.length > 25 || !/^\+?[\d\s().-]+$/.test(valor.trim())) {
    throw new DadosEntregaInvalidosError("Telefone inválido");
  }
  let digitos = valor.replace(/\D/g, "");
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) {
    digitos = digitos.slice(2);
  }
  if (!/^\d{10,11}$/.test(digitos)) {
    throw new DadosEntregaInvalidosError("Telefone deve ter 10 ou 11 números");
  }
  return digitos;
}

function normalizarCep(valor: unknown) {
  if (typeof valor !== "string" || valor.length > 9 || !/^\d{5}-?\d{3}$/.test(valor.trim())) {
    throw new DadosEntregaInvalidosError("CEP deve ter 8 números");
  }
  return valor.replace(/\D/g, "");
}

export function normalizarDadosCheckout(data: unknown): DadosCheckout {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new DadosEntregaInvalidosError("Dados do checkout inválidos");
  }
  const campos = data as Record<string, unknown>;
  const metodoEntrega = campos.metodoEntrega;
  const formaPagamento = campos.formaPagamento;
  if (!METODOS_ENTREGA.includes(metodoEntrega as MetodoEntrega)) {
    throw new DadosEntregaInvalidosError("Método de entrega inválido");
  }
  if (!FORMAS_PAGAMENTO.includes(formaPagamento as FormaPagamento)) {
    throw new DadosEntregaInvalidosError("Forma de pagamento inválida");
  }

  const entrega = metodoEntrega === "Entrega";
  return {
    nomeCliente: lerTexto(campos, "nomeCliente", "Nome", 2, 100)!,
    telefone: normalizarTelefone(campos.telefone),
    metodoEntrega: metodoEntrega as MetodoEntrega,
    formaPagamento: formaPagamento as FormaPagamento,
    cep: entrega ? normalizarCep(campos.cep) : null,
    rua: lerTexto(campos, "rua", "Rua", 2, 150, entrega),
    numero: lerTexto(campos, "numero", "Número", 1, 20, entrega),
    bairro: lerTexto(campos, "bairro", "Bairro", 2, 100, entrega),
    complemento: entrega ? lerTexto(campos, "complemento", "Complemento", 0, 150, false) : null,
    referencia: entrega ? lerTexto(campos, "referencia", "Ponto de referência", 0, 200, false) : null,
  };
}

export const normalizarDadosEntrega = normalizarDadosCheckout;
