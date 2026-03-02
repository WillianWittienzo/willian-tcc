
import { CiClock2 } from "react-icons/ci";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";



 const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      title: 'Endereço',
      content: 'Rua das Pizzas, 123\nCentro - São Paulo, SP'
    },
    {
      icon: FaPhoneAlt,
      title: 'Telefone',
      content: '(11) 99999-9999\n(11) 3333-3333'
    },
    {
      icon: CiClock2,
      title: 'Horário',
      content: 'Ter - Dom: 18h às 23h\nSegunda: Fechado'
    },
    {
      icon: AiOutlineMail,
      title: 'E-mail',
      content: 'contato@brasaquente.com.br'
    },
  ];
export default function ContatoPage() {
  return (
    <main className="py-20">
      <section >
        <div className="mx-auto max-w-8xl py-20 -mt-4 bg-[hsl(0deg_83.78%_21.76%)]">
          <h1 className="text-6xl font-bold text-amber-50 flex justify-center gap-2">
            Nosso<span className="text-amber-500">História</span>
          </h1>
          <p className="text-amber-50 flex justify-center text-sm">Conheça a Brasa Quente</p>
        </div>
      </section>


      <div className="flex justify-center lg:justify-end px-5 py-5">
          <div className="rounded-xl bg-white p-4 shadow relative hover:-translate-y-1 transition-all duration-200">
          <div className="container">
            <div className="py-10">
              <h2 className="font-display text-3xl text-foreground">
                INFORMAÇÕES DE CONTATO
              </h2>
              <p className="mt-4 text-muted-foreground">
                Entre em contato conosco por qualquer um dos canais abaixo.
                Ficaremos felizes em atendê-lo!
              </p>
              <div className="mt-8 space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/20">
                      <info.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{info.title}</h3>
                      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                        {info.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
        </div>


        <div className="flex justify-center lg:justify-end px-5 py-5">
          <div className="rounded-xl bg-white p-4 shadow relative hover:-translate-y-1 transition-all duration-200">
            <h1 className="text-3xl font-bold">Contato</h1>

            <p className="mt-4 text-zinc-600">Entre em contato conosco para dúvidas, pedidos ou parcerias.</p>

            <form className="mt-8 space-y-4">
              <input
                type="text"
                placeholder="Nome"
                className="w-full rounded-md border p-3" />

              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-md border p-3"
              />

              <textarea
                placeholder="Mensagem"
                className="w-full rounded-md border p-3"
                rows={4}
              />

              <button className="rounded-md bg-black w-full py-3 text-white">
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>

    </main>
  );
}
