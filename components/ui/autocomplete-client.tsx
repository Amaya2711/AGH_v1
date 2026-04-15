"use client";
import { useState, useMemo } from "react";

interface Cliente {
  id_cliente: string;
  nombre: string;
  ruc?: string;
}

interface AutocompleteClientProps {
  clientes: Cliente[];
  value: string;
  onChange: (id: string) => void;
}

export function AutocompleteClient({ clientes, value, onChange }: AutocompleteClientProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const opciones = useMemo(() => {
    if (!input.trim()) return clientes;
    const filtro = input.trim().toLowerCase();
    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(filtro) || (c.ruc?.toLowerCase().includes(filtro) ?? false)
    );
  }, [clientes, input]);

  const selected = clientes.find(c => c.id_cliente === value);

  return (
    <div className="relative">
      <input
        className="input input-bordered w-full"
        placeholder="Buscar cliente..."
        value={focused ? input : selected ? `${selected.nombre}${selected.ruc ? ` (${selected.ruc})` : ''}` : input}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 100)}
        onChange={e => {
          setInput(e.target.value);
          onChange("");
        }}
        autoComplete="off"
      />
      {focused && opciones.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-border rounded shadow max-h-48 overflow-auto">
          {opciones.map(c => (
            <li
              key={c.id_cliente}
              className={`px-3 py-2 cursor-pointer hover:bg-surface-strong ${c.id_cliente === value ? "bg-surface-strong" : ""}`}
              onMouseDown={() => {
                setInput("");
                onChange(c.id_cliente);
                setFocused(false);
              }}
            >
              {c.nombre} {c.ruc ? `(${c.ruc})` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
