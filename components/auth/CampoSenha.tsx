"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  mostrarOrientacao?: boolean;
};

export function CampoSenha({ id, label, value, onChange, autoComplete, mostrarOrientacao = false }: Props) {
  const [visivel, setVisivel] = useState(false);

  return (
    <label htmlFor={id} className="block text-sm font-semibold">
      {label}
      <span className="relative mt-1 block">
        <input
          id={id}
          type={visivel ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={autoComplete === "new-password" ? 8 : undefined}
          maxLength={128}
          required
          className="w-full rounded-md border p-3 pr-11 font-normal"
        />
        <button
          type="button"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-gray-500 hover:text-gray-800"
        >
          {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </span>
      {mostrarOrientacao && (
        <small className="mt-1 block font-normal text-gray-500">
          Use ao menos 8 caracteres. Frases longas são aceitas; evite senhas comuns ou previsíveis.
        </small>
      )}
    </label>
  );
}
