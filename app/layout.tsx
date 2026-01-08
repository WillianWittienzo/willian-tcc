import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
dado    </html>
  );
}
