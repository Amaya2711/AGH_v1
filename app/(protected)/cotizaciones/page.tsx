"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CotizacionesTable } from "@/modules/cotizaciones/ui/components/cotizaciones-table";
import { AutocompleteClient } from "@/components/ui/autocomplete-client";
import { useRef, useLayoutEffect } from "react";

async function fetchClientes() {
  const res = await fetch("/api/clientes/list");
  if (!res.ok) return [];
  return res.json();
}

// Tipado explícito para los parámetros de filtro
interface CotizacionesFiltro {
  clienteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  monedaId?: string;
}

// Tipado explícito para los clientes
interface Cliente {
  id_cliente: string;
  nombre: string;
  ruc?: string;
}

// Tipado explícito para las monedas
interface Moneda {
  id_moneda: string;
  nombre_moneda: string;
  simbolo?: string;
}

async function fetchMonedas() {
  const res = await fetch("/api/monedas/list");
  if (!res.ok) return [];
  return res.json();
}

async function fetchCotizaciones({ clienteId, fechaDesde, fechaHasta, monedaId }: CotizacionesFiltro) {
  const params = new URLSearchParams();
  if (clienteId) params.append("clienteId", clienteId);
  if (fechaDesde) params.append("fechaDesde", fechaDesde);
  if (fechaHasta) params.append("fechaHasta", fechaHasta);
  if (monedaId) params.append("monedaId", monedaId);
  const res = await fetch(`/api/cotizaciones/list?${params.toString()}`);
  if (!res.ok) return [];
  return res.json();
}

export default function CotizacionesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [monedaId, setMonedaId] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [loading, setLoading] = useState(false);
  const clienteDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClientes().then(setClientes);
    fetchMonedas().then(setMonedas);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCotizaciones({ clienteId, fechaDesde, fechaHasta, monedaId })
      .then(setCotizaciones)
      .finally(() => setLoading(false));
  }, [clienteId, fechaDesde, fechaHasta, monedaId]);

  useLayoutEffect(() => {
    if (!clienteDivRef.current) return;
    // Buscar el cliente con nombre+ruc más largo
    const max = clientes.reduce((acc, c) => {
      const len = `${c.nombre}${c.ruc ? ` (${c.ruc})` : ""}`.length;
      return len > acc ? len : acc;
    }, 20);
    // Aproximar a px (8px por caracter, mínimo 200)
    const px = Math.max(200, Math.min(600, max * 8));
    clienteDivRef.current.style.minWidth = px + "px";
  }, [clientes]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Modulo
          </p>
          <h2 className="text-3xl font-bold text-foreground">Cotizaciones</h2>
        </div>
        <Link href="/cotizaciones/nueva">
          <Button>Nueva cotizacion</Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-4 items-end bg-surface p-4 rounded-xl border border-border mb-4">
        <div ref={clienteDivRef}>
          <label className="block text-xs font-semibold mb-1">Cliente</label>
          <AutocompleteClient
            clientes={clientes}
            value={clienteId}
            onChange={setClienteId}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Moneda</label>
          <select
            className="input input-bordered"
            value={monedaId}
            onChange={e => setMonedaId(e.target.value)}
          >
            <option value="">Todas</option>
            {monedas.map((m) => (
              <option key={m.id_moneda} value={m.id_moneda}>
                {m.nombre_moneda} {m.simbolo ? `(${m.simbolo})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Desde</label>
          <input
            type="date"
            className="input input-bordered"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Hasta</label>
          <input
            type="date"
            className="input input-bordered"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
          />
        </div>
      </form>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando...</div>
      ) : (
        <CotizacionesTable cotizaciones={cotizaciones ?? []} />
      )}
    </section>
  );
}
