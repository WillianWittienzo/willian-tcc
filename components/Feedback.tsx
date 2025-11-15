"use client";

import React from "react";
import styles from "./Feedback.module.css";
import { MessageCircle } from "lucide-react";

const feedbacks = [
  {
    name: "",
    message:
      "Eu gostei muito que, após cada avaliação, você adapta para a gente melhorar onde não está evoluindo bem. A cada mês que passa, conseguimos ver nitidamente os resultados! Adorando seu trabalho! 🔥",
    time: "há 2 dias",
  },
  {
    name: "",
    message:
      " Está indo bem!! Estou até na academia agora treinando. E ontem minhas amigas estavam falando que minha bunda cresceu, fiquei até feliz com isso kkkk 💪",
    time: "há 1 semana",
  },
  {
    name: "",
    message:
      "Adorei, Lucas. Muito obrigado por explicar tudo. Realmente nunca fizeram uma avaliação dessas, adorei. Realmente, os locais que você pontuou são os que mais me incomodam, principalmente tríceps. Adorei mesmo.",
    time: "há 3 dias",
  },
  {
    name: "",
    message:
      "Vamo boraa! Valeuu. Tô curtindo os resultados, tá vindo bem rápido."
      ,
    time: "há 3 dias",
  },
  {
    name: "",
    message:
      "Vamos boraa! Valeuu"
      ,
    time: "há 3 dias",
  },
  {
    name: "",
    message:
      "Achei Top"
      ,
    time: "há 5 dias",
  },
] as const;

const Feedback: React.FC = () => {
  return (
    <section className={styles.feedbackSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>Depoimentos</div>
          <h2 className={styles.title}>O que meus alunos dizem</h2>
          <p className={styles.subtitle}>
            Feedback real de pessoas que estão vivendo suas transformações
          </p>
        </div>

        {/* Cards */}
        <div className={styles.feedbackGrid}>
          {feedbacks.map((feedback, index) => (
            <div key={index} className={styles.feedbackCard}>
              <div className={styles.feedbackHeader}>
                <div className={styles.avatar}>
                  <MessageCircle className={styles.icon} />
                </div>
                <div>
                  <div className={styles.name}>{feedback.name}</div>
                  <div className={styles.time}>{feedback.time}</div>
                </div>
              </div>
              <div className={styles.feedbackMessage}>
                <p>{feedback.message}</p>
                <div className={styles.tail}></div>
              </div>
            </div>
          ))}
        </div>
        {/* Social Proof */}
        <div className={styles.socialProof}>
          <div className={styles.avatarGroup}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.avatarSmall}></div>
            ))}
          </div>
          <span>
            <strong>+200 alunos</strong> já transformaram suas vidas
          </span>
        </div>
      
        {/* Botão */}
        <div className={styles.ctaContainer}>
          <button className={styles.ctaButton} onClick={() => window.open("https://wa.me/44991145515?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Coqueiro%20Team!!")}>Entrar no Time</button>
        </div>
      </div>
    </section>
  );
};;

export default Feedback;
