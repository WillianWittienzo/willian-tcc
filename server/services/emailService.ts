import nodemailer from "nodemailer";

type MensagemEmail = {
  para: string;
  assunto: string;
  texto: string;
  html: string;
};

let transporte: ReturnType<typeof nodemailer.createTransport> | null = null;

function configuracaoSmtp() {
  const host = process.env.SMTP_HOST?.trim();
  const porta = Number(process.env.SMTP_PORT ?? "587");
  const remetente = process.env.EMAIL_FROM?.trim();
  if (!host || !remetente || !Number.isInteger(porta) || porta < 1 || porta > 65535) return null;
  const usuario = process.env.SMTP_USER?.trim();
  const senha = process.env.SMTP_PASS;
  if ((usuario && !senha) || (!usuario && senha)) return null;
  return { host, porta, remetente, usuario, senha };
}

function baseSeguraDaAplicacao() {
  const baseRecebida = process.env.APP_BASE_URL?.trim();
  if (!baseRecebida) return null;
  try {
    const base = new URL(baseRecebida);
    if (base.protocol === "https:" || (process.env.NODE_ENV !== "production" && base.protocol === "http:")) {
      return base;
    }
  } catch {
    // A configuração inválida é tratada como ausente para não gerar links inseguros.
  }
  return null;
}

export function urlSeguraDaAplicacao(caminho: string, token: string) {
  const base = baseSeguraDaAplicacao();
  if (!base) return null;
  const url = new URL(caminho, base);
  url.searchParams.set("token", token);
  return url.toString();
}

export const emailService = {
  configurado() {
    return Boolean(configuracaoSmtp() && baseSeguraDaAplicacao());
  },

  async enviar(mensagem: MensagemEmail) {
    const configuracao = configuracaoSmtp();
    if (!configuracao) return { enviado: false, motivo: "SMTP não configurado" };

    if (!transporte) {
      transporte = nodemailer.createTransport({
        host: configuracao.host,
        port: configuracao.porta,
        secure: process.env.SMTP_SECURE === "true" || configuracao.porta === 465,
        auth: configuracao.usuario && configuracao.senha
          ? { user: configuracao.usuario, pass: configuracao.senha }
          : undefined,
      });
    }

    try {
      await transporte.sendMail({
        from: configuracao.remetente,
        to: mensagem.para,
        subject: mensagem.assunto,
        text: mensagem.texto,
        html: mensagem.html,
      });
      return { enviado: true as const };
    } catch (error) {
      console.error("Falha ao enviar e-mail transacional via SMTP:", error instanceof Error ? error.message : "erro desconhecido");
      return { enviado: false, motivo: "Falha no envio SMTP" };
    }
  },
};
