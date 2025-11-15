"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Check } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./Plans.module.css";

const treinoPlans = [
  {
    title: "Plano Mensal",
    oldPrice: 200,
    price: 180,
    desc: "ESSE É SÓ SE VOCÊ TIVER MUITO MEDO DE COMEÇAR",
  },
  {
    title: "Plano Trimestral",
    oldPrice: 510,
    price: 450,
    desc: "ESSE É O IDEAL PARA VOCÊ TER UM MÍNIMO RESULTADO",
  },
  {
    title: "Plano Semestral",
    oldPrice: 960,
    price: 870,
    desc: "AO FINAL DESSE VOCÊ TERIA UM RESULTADO MAIOR AINDA",
  },
  {
    title: "Plano Anual",
    oldPrice: 1920,
    price: 1680,
    desc: "E ESSE É O QUE MAIS COMPENSA FINANCEIRAMENTE",
  },
];

const treinoDietaPlans = [
  {
    title: "Plano Mensal",
    oldPrice: 300,
    price: 280,
    desc: "ESSE É SÓ SE VOCÊ TIVER MUITO MEDO DE COMEÇAR",
  },
  {
    title: "Plano Trimestral",
    oldPrice: 660,
    price: 600,
    desc: "ESSE É O IDEAL PARA VOCÊ TER UM MÍNIMO RESULTADO",
  },
  {
    title: "Plano Semestral",
    oldPrice: 1260,
    price: 1140,
    desc: "AO FINAL DESSE VOCÊ TERIA UM RESULTADO MAIOR AINDA",
  },
  {
    title: "Plano Anual",
    oldPrice: 2400,
    price: 2160,
    desc: "E ESSE É O QUE MAIS COMPENSA FINANCEIRAMENTE",
  },
];

const PlanCarousel = ({
  title,
  plans,
  highlight,
}: {
  title: string;
  plans: any[];
  highlight?: boolean;
}) => {
  return (
    <div
      className={`${styles.mainCard} ${
        highlight ? styles.dietaHighlight : ""
      }`}
    >
      <h2
        className={`${styles.planMainTitle} ${
          highlight ? styles.dietaTitle : ""
        }`}
      >
        {title}
      </h2>

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 6000 }}
      >
        {plans.map((plan, index) => (
          <SwiperSlide key={index}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>{plan.title}</h3>
                <p className={styles.planDesc}>{plan.desc}</p>
              </div>

              <div className={styles.priceBox}>
                <div className={styles.anchorage}>
                  <span className={styles.oldPrice}>
                    R$ {plan.oldPrice.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className={styles.priceLine}>
                  <span className={styles.rs}>R$</span>
                  <span className={styles.price}>
                    {plan.price.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              <ul className={styles.features}>
                <li>
                  <Check size={18} className={styles.checkIcon} />
                  <span>Acompanhamento personalizado</span>
                </li>
                <li>
                  <Check size={18} className={styles.checkIcon} />
                  <span>Suporte via WhatsApp</span>
                </li>
                <li>
                  <Check size={18} className={styles.checkIcon} />
                  <span>Ajustes mensais</span>
                </li>
                {highlight && (
                  <li>
                    <Check size={18} className={styles.checkIcon} />
                    <span>Plano alimentar incluso</span>
                  </li>
                )}
              </ul>

              <button
                className={`${styles.button} ${
                  highlight
                    ? styles.buttonPrimary
                    : styles.buttonSecondary
                }`}
              >
                Começar agora
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

const Plans = () => {
  return (
    <section id="planos" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.twoColumns}>
          <PlanCarousel title="PLANOS TREINO" plans={treinoPlans} />
          <PlanCarousel
            title="PLANOS TREINO & DIETA"
            plans={treinoDietaPlans}
            highlight
          />
        </div>

        <div className={styles.guarantee}>
          ✅ <strong>Garantia de 7 dias</strong> - Se não gostar, devolvemos
          100% do seu investimento
        </div>
      </div>
    </section>
  );
};

export default Plans;
