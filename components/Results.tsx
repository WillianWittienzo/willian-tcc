"use client";
import { useState } from "react";
import styles from "./Results.module.css";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

// 1. A interface pode ficar aqui fora
interface ResultType {  
  photos: string[];
  result: string;
}

export default function Carousel() {
  // 2. Mova o array 'results' para DENTRO do componente
  const results: ResultType[] = [
    {
     
      photos: ["/resultados/resultado_01.jpeg", "/resultados/resultado_02.jpeg"],
      result: "Redução de 15% de gordura corporal",
    },
    {
     
      photos: ["/resultados/resultado_03.jpeg", "/resultados/resultado_04.jpeg"],
      result: "Aumento de massa muscular",
    },
    {
    
      photos: ["/resultados/resultado_05.jpeg", "/resultados/resultado_06.jpeg"],
      result: "Melhora na postura e definição",
    },
    {
   
      photos: ["/resultados/resultado_07.jpeg", "/resultados/resultado_08.jpeg"],
      result: "Mais energia e disposição no dia a dia",
    },
    {
    
      photos: ["/resultados/resultado_11.jpeg", "/resultados/resultado_10.jpeg"],
      result: "Ganho de força e resistência",
    },
    {
      
      photos: ["/resultados/resultado_09.jpeg", "/resultados/resultado_12.jpeg"],
      result: "Definição e tonificação muscular",
    },
  ];

  const [photoIndexes, setPhotoIndexes] = useState<number[]>(results.map(() => 0));
  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleGoTo = (cardIdx: number, photoIdx: number) => {
    setPhotoIndexes((prev) =>
      prev.map((p, i) => (i === cardIdx ? photoIdx : p))
    );
  };

  const handleNext = (idx: number) => {
    setPhotoIndexes((prev) =>
      prev.map((p, i) => (i === idx ? (p + 1) % results[idx].photos.length : p))
    );
  };

  const handlePrev = (idx: number) => {
    setPhotoIndexes((prev) =>
      prev.map((p, i) =>
        i === idx ? (p - 1 + results[idx].photos.length) % results[idx].photos.length : p
      )
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent, idx: number) => {
    if (!isDragging || startX === null) return;
    const diff = startX - e.touches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext(idx);
      else handlePrev(idx);
      setIsDragging(false);
      setStartX(null);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setStartX(null);
  };

  return (
    <section id="resultados" className={styles.wrapper}>
      <div className={styles.cardphoto}>
        <div className={styles.header}>
          <div className={styles.tagline}>Transformações</div>
          <h2 className={styles.title}>Como Funciona a Consultoria</h2>
          <p className={styles.description}>
            Essas são algumas das transformações que meus alunos conquistaram com
            <br />
            dedicação, consistência e o acompanhamento adequado.
          </p>
        </div>

        <div className={styles.container}>
          {results.map((result, idx) => (
            <div key={idx} className={styles.card}>
              <div
                className={styles.imageWrapper}
                onTouchStart={handleTouchStart}
                onTouchMove={(e) => handleTouchMove(e, idx)}
                onTouchEnd={handleTouchEnd}
              >
                <button className={styles.arrowLeft} onClick={() => handlePrev(idx)}>
                  <BsArrowLeft />
                </button>

                <div
                  className={styles.imageTrack}
                  style={{ transform: `translateX(-${photoIndexes[idx] * 100}%)` }}
                >
                  {result.photos.map((photo, i) => (
                    <div key={i} className={styles.imageSlide}>
                      <img
                        src={photo}
                        alt={`${i + 1}`}
                        className={styles.image}
                      />
                    </div>
                  ))}
                </div>

                <button className={styles.arrowRight} onClick={() => handleNext(idx)}>
                  <BsArrowRight />
                </button>

                <div className={styles.dots}>
                  {result.photos.map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.dot} ${photoIndexes[idx] === i ? styles.activeDot : ''}`}
                      onClick={() => handleGoTo(idx, i)}
                      aria-label={`Ir para a foto ${i + 1}`}
                    />
                  ))}
                </div>

              </div>

              <div className={styles.info}>
                <p>{result.result}</p>
              </div>
            </div>
          ))}
        </div>

    
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div>
              <div className={styles.statNumber}>97%</div>
              <div className={styles.statLabel}>Taxa de satisfação</div>
            </div>
            <div>
              <div className={styles.statNumber}>6+</div>
              <div className={styles.statLabel}>Anos de experiência</div>
            </div>
            <div>
              <div className={styles.statNumber}>200+</div>
              <div className={styles.statLabel}>Alunos transformados</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}