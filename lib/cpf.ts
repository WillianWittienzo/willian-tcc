export function somenteDigitosCpf(valor: unknown) {
  return typeof valor === "string" ? valor.replace(/\D/g, "") : "";
}

export function cpfValido(valor: unknown) {
  const cpf = somenteDigitosCpf(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (quantidade: number) => {
    const soma = cpf
      .slice(0, quantidade)
      .split("")
      .reduce((total, digito, indice) => total + Number(digito) * (quantidade + 1 - indice), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(9) === Number(cpf[9])
    && calcularDigito(10) === Number(cpf[10]);
}

export function formatarCpf(valor: unknown) {
  const cpf = somenteDigitosCpf(valor).slice(0, 11);
  return cpf
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}
