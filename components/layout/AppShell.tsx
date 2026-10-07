"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthProvider } from "@/app/context/AuthContext";
import { CartProvider } from "@/app/context/CartContext";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const rotaAdministrativa = pathname.startsWith("/admin");

  return (
    <AuthProvider>
      <CartProvider>
        {rotaAdministrativa ? children : (
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        )}
      </CartProvider>
    </AuthProvider>
  );
}
