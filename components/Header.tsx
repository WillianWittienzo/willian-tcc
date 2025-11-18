"use client";

import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";
import Image from "next/image";

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
      <div className={styles.logo}>
        Lucas Coqueiro
        <Image src='/logo.png' width={80} height={80} alt="logo" />
      </div>

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

      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? "✕" : "☰"}
      </button>

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
