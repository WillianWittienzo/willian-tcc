import type { MetodoEntrega } from "@/lib/pedido";

export const METODOS_ENTREGA = ["Entrega", "Retirada"] as const;
export const FORMAS_PAGAMENTO = ["Dinheiro", "Cartão", "Pix"] as const;

export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];
export type FormaPagamentoHistorica = FormaPagamento | "Boleto";

export type DadosCheckout = {
  nomeCliente: string;
  telefone: string;
  metodoEntrega: MetodoEntrega;
  formaPagamento: FormaPagamento;
  precisaTroco: boolean;
  valorParaTroco: number | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  referencia: string | null;
};

export type DadosEntrega = DadosCheckout;
export type EnderecoEntrega = {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string | null;
  referencia: string | null;
};

export const ROTA_CHECKOUT = "/carrinho?checkout=1";

export function obterRetornoCompra(search: string) {
  const retorno = new URLSearchParams(search).get("retorno");
  return retorno === ROTA_CHECKOUT ? retorno : null;
}

export function criarUrlAutenticacao(rota: "/login" | "/cadastro") {
  return `${rota}?retorno=${encodeURIComponent(ROTA_CHECKOUT)}`;
}

export class DadosEntregaInvalidosError extends Error {}

export function calcularTrocoEmCentavos(valorParaTroco: number, totalEmCentavos: number) {
  const valorParaTrocoEmCentavos = Math.round(valorParaTroco * 100);
  if (!Number.isInteger(totalEmCentavos) || totalEmCentavos < 0 || valorParaTrocoEmCentavos <= totalEmCentavos) {
    throw new DadosEntregaInvalidosError(
      `O valor para troco deve ser maior que o total definitivo de R$ ${(totalEmCentavos / 100).toFixed(2).replace(".", ",")}`,
    );
  }
  return {
    valorParaTrocoEmCentavos,
    valorTrocoEmCentavos: valorParaTrocoEmCentavos - totalEmCentavos,
  };
}

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

export function normalizarEnderecoEntrega(data: unknown): EnderecoEntrega {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new DadosEntregaInvalidosError("Endereço inválido");
  }
  const campos = data as Record<string, unknown>;
  return {
    cep: normalizarCep(campos.cep),
    rua: lerTexto(campos, "rua", "Rua", 2, 150)!,
    numero: lerTexto(campos, "numero", "Número", 1, 20)!,
    bairro: lerTexto(campos, "bairro", "Bairro", 2, 100)!,
    complemento: lerTexto(campos, "complemento", "Complemento", 0, 150, false),
    referencia: lerTexto(campos, "referencia", "Ponto de referência", 0, 200, false),
  };
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
  const endereco = entrega ? normalizarEnderecoEntrega(campos) : null;
  const precisaTrocoRecebido = campos.precisaTroco;
  if (precisaTrocoRecebido !== undefined && typeof precisaTrocoRecebido !== "boolean") {
    throw new DadosEntregaInvalidosError("Informe corretamente se precisa de troco");
  }
  const precisaTroco = formaPagamento === "Dinheiro" && precisaTrocoRecebido === true;
  let valorParaTroco: number | null = null;
  if (precisaTroco) {
    const valor = campos.valorParaTroco;
    if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0 || valor > 100000 || Math.abs(Math.round(valor * 100) - valor * 100) > 1e-8) {
      throw new DadosEntregaInvalidosError("Informe um valor válido, com até duas casas decimais, para o troco");
    }
    valorParaTroco = valor;
  }
  return {
    nomeCliente: lerTexto(campos, "nomeCliente", "Nome", 2, 100)!,
    telefone: normalizarTelefone(campos.telefone),
    metodoEntrega: metodoEntrega as MetodoEntrega,
    formaPagamento: formaPagamento as FormaPagamento,
    precisaTroco,
    valorParaTroco,
    cep: endereco?.cep ?? null,
    rua: endereco?.rua ?? null,
    numero: endereco?.numero ?? null,
    bairro: endereco?.bairro ?? null,
    complemento: endereco?.complemento ?? null,
    referencia: endereco?.referencia ?? null,
  };
}

export const normalizarDadosEntrega = normalizarDadosCheckout;
