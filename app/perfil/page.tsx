"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  alterarSenha,
  atualizarDadosPessoais,
  atualizarEndereco,
  buscarPerfil,
  type PerfilCliente,
} from "@/client/authClient";

const enderecoVazio = {
  cep: "",
  rua: "",
  numero: "",
  bairro: "",
  complemento: "",
  referencia: "",
};

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [erro, setErro] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [mensagemDados, setMensagemDados] = useState("");
  const [erroDados, setErroDados] = useState(false);
  const [endereco, setEndereco] = useState(enderecoVazio);
  const [salvandoEndereco, setSalvandoEndereco] = useState(false);
  const [mensagemEndereco, setMensagemEndereco] = useState("");
  const [erroEndereco, setErroEndereco] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [mensagemSenha, setMensagemSenha] = useState("");
  const [erroSenha, setErroSenha] = useState(false);
  const { user, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;
    if (!user) {
      router.replace("/login?retorno=/perfil");
      return;
    }
    if (user.papel !== "Cliente") {
      router.replace("/admin");
      return;
    }

    buscarPerfil()
      .then((dados) => {
        setPerfil(dados);
        setNome(dados.nome);
        setTelefone(dados.telefone ?? "");
        setEndereco({
          cep: dados.cep ?? "",
          rua: dados.rua ?? "",
          numero: dados.numero ?? "",
          bairro: dados.bairro ?? "",
          complemento: dados.complemento ?? "",
          referencia: dados.referencia ?? "",
        });
      })
      .catch((error) => setErro(error instanceof Error ? error.message : "Erro ao carregar perfil"));
  }, [carregando, router, user]);

  async function salvarDadosPessoais(event: React.FormEvent) {
    event.preventDefault();
    setSalvandoDados(true);
    setMensagemDados("");
    setErroDados(false);
    try {
      const atualizado = await atualizarDadosPessoais({ nome, telefone });
      setPerfil(atualizado);
      setNome(atualizado.nome);
      setTelefone(atualizado.telefone ?? "");
      setMensagemDados("Dados pessoais atualizados com sucesso.");
    } catch (error) {
      setErroDados(true);
      setMensagemDados(error instanceof Error ? error.message : "Erro ao atualizar dados pessoais");
    } finally {
      setSalvandoDados(false);
    }
  }

  async function salvarEndereco(event: React.FormEvent) {
    event.preventDefault();
    setSalvandoEndereco(true);
    setMensagemEndereco("");
    setErroEndereco(false);
    try {
      const atualizado = await atualizarEndereco(endereco);
      setPerfil(atualizado);
      setEndereco({
        cep: atualizado.cep ?? "",
        rua: atualizado.rua ?? "",
        numero: atualizado.numero ?? "",
        bairro: atualizado.bairro ?? "",
        complemento: atualizado.complemento ?? "",
        referencia: atualizado.referencia ?? "",
      });
      setMensagemEndereco("Endereço atualizado com sucesso.");
    } catch (error) {
      setErroEndereco(true);
      setMensagemEndereco(error instanceof Error ? error.message : "Erro ao atualizar endereço");
    } finally {
      setSalvandoEndereco(false);
    }
  }

  function alterarEndereco(campo: keyof typeof enderecoVazio, valor: string) {
    setEndereco((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvarSenha(event: React.FormEvent) {
    event.preventDefault();
    setAlterandoSenha(true);
    setMensagemSenha("");
    setErroSenha(false);
    try {
      const resultado = await alterarSenha({ senhaAtual, novaSenha, confirmarNovaSenha });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
      setMensagemSenha(`${resultado.mensagem}. As outras sessões da conta foram encerradas.`);
    } catch (error) {
      setErroSenha(true);
      setMensagemSenha(error instanceof Error ? error.message : "Erro ao alterar senha");
    } finally {
      setAlterandoSenha(false);
    }
  }

  if (carregando || (!perfil && !erro)) {
    return <main className="mx-auto min-h-screen max-w-4xl px-6 py-28"><p>Carregando perfil...</p></main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-28 sm:px-6">
      <h1 className="text-3xl font-bold">Meu Perfil</h1>
      <p className="mt-2 text-gray-600">Gerencie seus dados pessoais, endereço e segurança.</p>

      {erro && <p className="mt-6 rounded-md bg-red-100 p-4 text-red-800" role="alert">{erro}</p>}

      {perfil && (
        <div className="mt-8 grid gap-6">
          <section className="rounded-xl bg-white p-5 shadow sm:p-6">
            <h2 className="text-xl font-bold">Dados pessoais</h2>
            <form onSubmit={salvarDadosPessoais} className="mt-4 grid gap-4 sm:grid-cols-2">
              {mensagemDados && <p className={`rounded-md p-3 text-sm sm:col-span-2 ${erroDados ? "bg-red-100 text-red-800" : "bg-green-50 text-green-800"}`} role={erroDados ? "alert" : "status"}>{mensagemDados}</p>}
              <label className="text-sm font-semibold">Nome
                <input value={nome} onChange={(event) => setNome(event.target.value)} minLength={2} maxLength={100} required className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <label className="text-sm font-semibold">Telefone
                <input value={telefone} onChange={(event) => setTelefone(event.target.value)} inputMode="tel" maxLength={25} required className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">E-mail
                <input value={perfil.email} readOnly className="mt-1 w-full rounded-md border bg-gray-100 p-3 font-normal text-gray-600" />
              </label>
              <button type="submit" disabled={salvandoDados} className="rounded-md bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50 sm:w-fit">
                {salvandoDados ? "Salvando..." : "Salvar dados"}
              </button>
            </form>
          </section>

          <section className="rounded-xl bg-white p-5 shadow sm:p-6">
            <h2 className="text-xl font-bold">Endereço de entrega</h2>
            {!perfil.cep && (
              <p className="mt-4 text-gray-600">Você ainda não possui um endereço cadastrado.</p>
            )}
            <form onSubmit={salvarEndereco} className="mt-4 grid gap-4 sm:grid-cols-2">
              {mensagemEndereco && <p className={`rounded-md p-3 text-sm sm:col-span-2 ${erroEndereco ? "bg-red-100 text-red-800" : "bg-green-50 text-green-800"}`} role={erroEndereco ? "alert" : "status"}>{mensagemEndereco}</p>}
              <label className="text-sm font-semibold">CEP
                <input value={endereco.cep} onChange={(event) => alterarEndereco("cep", event.target.value)} inputMode="numeric" maxLength={9} placeholder="00000-000" required className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <label className="text-sm font-semibold">Número
                <input value={endereco.numero} onChange={(event) => alterarEndereco("numero", event.target.value)} maxLength={20} required className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">Rua
                <input value={endereco.rua} onChange={(event) => alterarEndereco("rua", event.target.value)} maxLength={150} required className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <label className="text-sm font-semibold">Bairro
                <input value={endereco.bairro} onChange={(event) => alterarEndereco("bairro", event.target.value)} maxLength={100} required className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <label className="text-sm font-semibold">Complemento
                <input value={endereco.complemento} onChange={(event) => alterarEndereco("complemento", event.target.value)} maxLength={150} className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">Referência
                <input value={endereco.referencia} onChange={(event) => alterarEndereco("referencia", event.target.value)} maxLength={200} className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <button type="submit" disabled={salvandoEndereco} className="rounded-md bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50 sm:w-fit">
                {salvandoEndereco ? "Salvando..." : perfil.cep ? "Atualizar endereço" : "Salvar endereço"}
              </button>
            </form>
          </section>

          <section className="rounded-xl bg-white p-5 shadow sm:p-6">
            <h2 className="text-xl font-bold">Segurança</h2>
            <p className="mt-2 text-gray-600">Altere sua senha de acesso com confirmação da senha atual.</p>
            <form onSubmit={salvarSenha} className="mt-4 grid gap-4 sm:grid-cols-2">
              {mensagemSenha && <p className={`rounded-md p-3 text-sm sm:col-span-2 ${erroSenha ? "bg-red-100 text-red-800" : "bg-green-50 text-green-800"}`} role={erroSenha ? "alert" : "status"}>{mensagemSenha}</p>}
              <label className="text-sm font-semibold sm:col-span-2">Senha atual
                <input type="password" value={senhaAtual} onChange={(event) => setSenhaAtual(event.target.value)} autoComplete="current-password" maxLength={128} required className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <label className="text-sm font-semibold">Nova senha
                <input type="password" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <label className="text-sm font-semibold">Confirmar nova senha
                <input type="password" value={confirmarNovaSenha} onChange={(event) => setConfirmarNovaSenha(event.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required className="mt-1 w-full rounded-md border p-3 font-normal" />
              </label>
              <button type="submit" disabled={alterandoSenha} className="rounded-md bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50 sm:w-fit">
                {alterandoSenha ? "Alterando..." : "Alterar senha"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
