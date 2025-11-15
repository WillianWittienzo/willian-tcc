"use client";

import { FC } from "react";
import { Award, Target, Users } from "lucide-react";
import styles from "./About.module.css";

const About: FC = () => {
    return (
        <section id="sobre" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.grid}>

                    {/* Texto */}
                    <div className={styles.textContent}>
                        <div className={styles.label}>Quem sou eu</div>

                        <h2 className={styles.title}>LUCAS COQUEIRO</h2>

                        <p className={styles.paragraph}>
                            Sou Lucas Coqueiro, personal trainer há mais de <strong>6 anos</strong>.
                            Especialista em treino de força e reeducação corporal, ajudo homens e mulheres a
                            conquistarem resultados reais com um acompanhamento 100% individualizado.
                        </p>

                        <p className={styles.paragraph}>
                            Minha missão é provar que você não precisa de academia cara ou equipamentos
                            sofisticados para alcançar seus objetivos. Com dedicação, método e o suporte
                            certo, a transformação acontece.
                        </p>

                        <div className={styles.cards}>
                            <div className={styles.card}>
                                <Award className={styles.icon} />
                                <div className={styles.cardTitle}>Certificado</div>
                                <div className={styles.cardSubtitle}>CREF 123456-G/SP</div>
                            </div>

                            <div className={styles.card}>
                                <Target className={styles.icon} />
                                <div className={styles.cardTitle}>Resultados</div>
                                <div className={styles.cardSubtitle}>Comprovados</div>
                            </div>

                            <div className={styles.card}>
                                <Users className={styles.icon} />
                                <div className={styles.cardTitle}>200+</div>
                                <div className={styles.cardSubtitle}>Alunos ativos</div>
                            </div>
                        </div>
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

                    {/* Imagem */}
                    <div className={styles.imageWrapper}>
                        <div className={styles.imageContainer}>
                            <img
                                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80"
                                alt="LUCAS COQUEIRO - Personal Trainer"
                                className={styles.image}
                            />
                            <div className={styles.overlay}></div>
                            <div className={styles.quote}>
                                <div className={styles.quoteText}>
                                    "Seu progresso é minha motivação"
                                </div>
                                <div className={styles.quoteAuthor}>- LUCAS COQUEIRO </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default About;
