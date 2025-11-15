"use client";

import { useState } from "react";
import styles from "./FAQ.module.css";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "A consultoria é totalmente online?",
    answer:
      "Sim! Todo o acompanhamento é feito de forma 100% online. Você recebe seu plano de treino personalizado, pode tirar dúvidas pelo WhatsApp e fazer ajustes conforme sua evolução, tudo sem sair de casa.",
  },
  {
    question: "Os treinos são personalizados?",
    answer:
      "Absolutamente. Cada treino é criado especificamente para você, levando em conta seus objetivos, histórico de treino, equipamentos disponíveis, limitações físicas e disponibilidade de tempo.",
  },
  {
    question: "Em quanto tempo começo a ver resultados?",
    answer:
      "Isso varia de pessoa para pessoa, mas a maioria dos meus alunos começa a notar diferenças nas primeiras 3-4 semanas. O importante é seguir o plano com consistência e manter uma alimentação adequada.",
  },
  {
    question: "Preciso de equipamentos ou posso treinar em casa?",
    answer:
      "Você pode treinar tanto em casa quanto na academia! Adapto o treino conforme os equipamentos que você tem disponível. Se for treinar em casa, posso criar protocolos com peso corporal ou equipamentos básicos.",
  },
  {
    question: "Como funciona o suporte via WhatsApp?",
    answer:
      "Você tem meu contato direto e pode me enviar mensagens com dúvidas sobre execução de exercícios, alimentação ou qualquer questão relacionada ao seu treino. Respondo diariamente e estou sempre disponível para ajustar o que for necessário.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim, não há fidelidade. Você pode cancelar sua assinatura quando quiser. Mas tenho certeza que vai adorar os resultados e querer continuar! 😊",
  },
  {
    question: "Qual é a forma de pagamento?",
    answer:
      "Aceito PIX (com desconto especial) e cartão de crédito em até 12x sem juros. O pagamento é processado de forma segura e automática todo mês.",
  },
  {
    question: "Tem garantia?",
    answer:
      "Sim! Oferecemos garantia de 7 dias. Se você não gostar da consultoria por qualquer motivo, devolvemos 100% do seu investimento, sem perguntas.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.badge}>Dúvidas</div>
        <h2 className={styles.title}>Perguntas Frequentes</h2>
        <p className={styles.subtitle}>
          Tire suas principais dúvidas sobre a consultoria
        </p>
      </div>

      <div className={styles.faqList}>
        {faqData.map((item, idx) => (
          <div
            key={idx}
            className={`${styles.faqItem} ${openIndex === idx ? styles.open : ""}`}
          >
            <button className={styles.question} onClick={() => toggle(idx)}>
              {item.question}
              <span className={styles.icon}>{openIndex === idx ? "˄" : "˅"}</span>
            </button>
            <div className={styles.answer}>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cta}>
        <p>Ainda tem alguma dúvida?</p>
        <div className={styles.buttons}>
          <a
            href="https://wa.me/44991145515?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Coqueiro%20Team!!"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.entrarNotime}
          >
            🚀 Entrar no Time
          </a>
        </div>
      </div>
    </section>
  );
}
