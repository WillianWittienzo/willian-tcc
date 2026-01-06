export default function ContatoPage() {
  return (
    <main className="mx-auto max-w-4xl py-20 px-6">
      <h1 className="text-3xl font-bold">Contato</h1>

      <p className="mt-4 text-zinc-600">
        Entre em contato conosco para dúvidas, pedidos ou parcerias.
      </p>

      <form className="mt-8 space-y-4">
        <input
          type="text"
          placeholder="Nome"
          className="w-full rounded-md border p-3"
        />

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

        <button className="rounded-md bg-black px-6 py-3 text-white">
          Enviar
        </button>
      </form>
    </main>
  );
}
