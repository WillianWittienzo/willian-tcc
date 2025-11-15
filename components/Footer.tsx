"use client";
import React from "react";
import styles from "./Footer.module.css";
import { FaInstagram, FaWhatsapp,FaClock } from "react-icons/fa";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div>
            <div className={styles.title}>LUCAS COQUEIRO</div>
            <p className={styles.description}>
              Personal Trainer especializado em transformação física e reeducação corporal.
            </p>
            <div className={styles.cref}>CREF 123456-G/SP</div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={styles.heading}>Links Rápidos</h3>
            <ul className={styles.linkList}>
              {["sobre", "como-funciona", "resultados", "planos"].map((id) => (
                <li key={id}>
                  <button
                    onClick={() => scrollToSection(id)}
                    className={styles.linkButton}
                  >
                    {id.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className={styles.heading}>Redes Sociais</h3>
            <div className={styles.socialIcons}>
              {/* Coloque seus SVGs ou imagens aqui */}
              <a
                href="https://www.instagram.com/lucascof_/p/CqivRozLvqQ/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                {/* SVG Instagram */}
                <FaInstagram size={24}/>
              </a>
              <a
                href="https://wa.me/44991145515?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Coqueiro%20Team!!"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="WhatsApp"
              >
                {/* SVG WhatsApp */}
                <FaWhatsapp size={24}/>
              </a>
            </div>

            <div className={styles.contact}>
              {/* Coloque um SVG de relógio se quiser */}
              <FaClock size={24}/>
              <span>Atendimento: Seg - Sex, 8h às 20h</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottom}>
          <p>
            © {currentYear} LUCAS COQUEIRO - Personal Trainer. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
