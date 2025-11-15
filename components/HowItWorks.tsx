"use client";
import { ClipboardCheck, Dumbbell, LineChart, Trophy } from "lucide-react";
import styles from "./HowItWorks.module.css";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Avaliação e Objetivos",
    description:
      "Análise completa do seu perfil, histórico e metas. Definimos juntos um plano realista e alcançável.",
  },
  {
    icon: Dumbbell,
    title: "Criação do Plano de Treino",
    description:
      "Protocolo 100% personalizado baseado nas suas necessidades, disponibilidade e equipamentos.",
  },
  {
    icon: LineChart,
    title: "Acompanhamento e Ajustes",
    description:
      "Suporte direto via WhatsApp. Ajustes constantes conforme sua evolução e feedback.",
  },
  {
    icon: Trophy,
    title: "Resultados Consistentes",
    description:
      "Com dedicação e o método certo, os resultados aparecem. Você não está sozinho nessa jornada.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.tagline}>Metodologia</div>
          <h2 className={styles.title}>Como Funciona a Consultoria</h2>
          <p className={styles.description}>
            A consultoria é feita de forma online, com avaliação física personalizada,
            protocolo de treino exclusivo e acompanhamento direto via WhatsApp.
          </p>
        </div>

        {/* Steps */}
        <div className={styles.stepsGrid}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={styles.stepCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.stepNumber}>{index + 1}</div>
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} />
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className={styles.ctaWrapper}>
          <div className={styles.ctaCard}>
            <h3 className={styles.ctaTitle}>Pronto para começar sua transformação?</h3>
            <p className={styles.ctaDescription}>
              Não importa seu nível atual. O importante é dar o primeiro passo.
            </p>
            <div className={styles.buttonArea} >
              <button
                className={styles.buttonGroup}
                onClick={() =>
                  window.open(
                    "https://wa.me/44991145515?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Coqueiro%20Team!!"
                  )
                }
              >
                Comece agora
              </button>

              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
