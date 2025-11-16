"use client";

import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.logo}>LUCAS COQUEIRO</div>

      {/* MENU DESKTOP */}
      <nav className={styles.nav}>
        <button className={styles.navButton} onClick={() => scrollToSection("sobre")}>
          Sobre
        </button>
        <button className={styles.navButton} onClick={() => scrollToSection("como-funciona")}>
          Como Funciona
        </button>
        <button className={styles.navButton} onClick={() => scrollToSection("resultados")}>
          Resultados
        </button>
        <button className={styles.navButton} onClick={() => scrollToSection("planos")}>
          Planos
        </button>
        <button className={styles.startButton} onClick={() => scrollToSection("planos")}>
          Começar Agora
        </button>
      </nav>

      {/* BOTÃO MOBILE */}
      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* MENU MOBILE */}
      <nav className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.showMobileNav : ""}`}>
        <button onClick={() => scrollToSection("sobre")}>Sobre</button>
        <button onClick={() => scrollToSection("como-funciona")}>Como Funciona</button>
        <button onClick={() => scrollToSection("resultados")}>Resultados</button>
        <button onClick={() => scrollToSection("planos")}>Planos</button>
        <button className={styles.startButton} onClick={() => scrollToSection("planos")}>
          Começar Agora
        </button>
      </nav>
    </header>
  );
};

export default Header;
