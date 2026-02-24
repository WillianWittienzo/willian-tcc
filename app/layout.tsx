"use client"
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}