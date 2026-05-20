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

interface CotizacionListItem {
  id_cotizacion: string;
  anio: number;
  fecha: string;
  total: number;
  estado: boolean;
  cliente: { nombre: string; ruc: string } | null;
  moneda: { nombre_moneda: string; simbolo?: string | null } | null;
  estado_cotizacion: { nombre_estado: string } | null;
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
  const [cotizaciones, setCotizaciones] = useState<CotizacionListItem[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [monedaId, setMonedaId] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [requestVersion, setRequestVersion] = useState(1);
  const [resolvedVersion, setResolvedVersion] = useState(0);
  const clienteDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClientes().then(setClientes);
    fetchMonedas().then(setMonedas);
  }, []);

  useEffect(() => {
    let active = true;

    fetchCotizaciones({ clienteId, fechaDesde, fechaHasta, monedaId })
      .then((items) => {
        if (!active) return;
        setCotizaciones(items);
        setResolvedVersion(requestVersion);
      })
      .catch(() => {
        if (!active) return;
        setCotizaciones([]);
        setResolvedVersion(requestVersion);
      });

    return () => {
      active = false;
    };
  }, [clienteId, fechaDesde, fechaHasta, monedaId, requestVersion]);

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

  const loading = requestVersion !== resolvedVersion;

  const handleClienteChange = (value: string) => {
    setClienteId(value);
    setRequestVersion((current) => current + 1);
  };

  const handleMonedaChange = (value: string) => {
    setMonedaId(value);
    setRequestVersion((current) => current + 1);
  };

  const handleFechaDesdeChange = (value: string) => {
    setFechaDesde(value);
    setRequestVersion((current) => current + 1);
  };

  const handleFechaHastaChange = (value: string) => {
    setFechaHasta(value);
    setRequestVersion((current) => current + 1);
  };

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
            onChange={handleClienteChange}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Moneda</label>
          <select
            className="input input-bordered"
            value={monedaId}
            onChange={(e) => handleMonedaChange(e.target.value)}
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
            onChange={(e) => handleFechaDesdeChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Hasta</label>
          <input
            type="date"
            className="input input-bordered"
            value={fechaHasta}
            onChange={(e) => handleFechaHastaChange(e.target.value)}
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
