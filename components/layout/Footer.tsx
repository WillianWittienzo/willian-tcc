import { GoArrowRight } from "react-icons/go";
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { CiClock2 } from "react-icons/ci";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";

import Link from "next/link";

export default function Footer() {
  return (

    <footer className="w-full border-t border-[hsl(26.67deg_14.75%_88.04%)] py-10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>

            <h1 className="text-2xl font-bold">Brasa Quente</h1>
            <p className="text-sm text-gray-500 mt-2">
              As melhores pizzas da cidade, feitas com ingredientes selecionados e muito amor.
            </p>

            <div className="flex gap-4 mt-4">
              <FaInstagram size={24} className="text-red-500" />
              <FaFacebook size={24} className="text-blue-600" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold">Navegação</h1>
            <div className="text-sm text-gray-500 mt-2 ">
              <Link href="/"><p>Inicio</p></Link>
              <Link href="/cardapio"><p>Cardápio</p></Link>
              <Link href="/sobre"><p>Sobre</p></Link>
              <Link href="/contato"><p>Contato</p></Link>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold">Contato</h1>
            <div className="text-sm text-gray-500 mt-1 ">
              <Link href=""><p className="flex gap-2 "><FaMapMarkerAlt className="text-amber-600" />Rua das Pizzas, 123 Centro - São Paulo, SP</p></Link>
              <Link href="/"><p className="flex gap-2 items-center"><FaPhoneAlt className="text-amber-600" />(11) 99999-9999</p></Link>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold">Horários</h1>
            <div className="text-sm text-gray-500 mt-1 ">
              <p className="flex gap-2 items-center"><CiClock2 className="text-amber-600" />Ter - Dom:18h às 23h</p>
              <p>Segunda: Fechado</p>
            </div>
          </div>

        </div>
      </div>
      <div className="border-t mt-3 border-t border-[hsl(26.67deg_14.75%_88.04%)]">
        <h1 className="ml-8 text-sm text-gray-500 mt-2">© 2025 Brasa Quente Todos os direitos reservados.</h1>
      </div>
    </footer>

  );
}
