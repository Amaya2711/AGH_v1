"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import dynamic from "next/dynamic";
const ExportButtons = dynamic(() => import("./ExportButtons"), { ssr: false });

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

interface CotizacionesTableProps {
  cotizaciones: CotizacionListItem[];
}

export function CotizacionesTable({ cotizaciones }: CotizacionesTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Esta accion eliminara la cotizacion y sus detalles de forma permanente. Deseas continuar?"
    );
    if (!confirmed) return;

    setBusyId(id);
    setErrorMessage(null);
    setMessage(null);

    const response = await fetch(`/api/cotizaciones/${id}`, { method: "DELETE" });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setErrorMessage(payload?.message ?? "No se pudo eliminar la cotizacion.");
      setBusyId(null);
      return;
    }

    setMessage("Cotizacion eliminada correctamente.");
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-success">{message}</p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{errorMessage}</p>
      ) : null}

      <div className="relative rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto" style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table className="min-w-full text-sm">
            <thead className="bg-surface-strong text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {/* <th className="px-4 py-3">Año</th> */}
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3 text-right">Total</th>
                {/* <th className="px-4 py-3">Estado cierre</th> */}
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((cot) => (
                <tr key={cot.id_cotizacion} className="border-t border-border">
                  {/* <td className="px-4 py-3 text-muted-foreground">{cot.anio}</td> */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatPeruDate(cot.fecha)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {cot.cliente?.nombre ?? "-"}
                    <span className="ml-1 text-xs text-muted-foreground">
                      {cot.cliente?.ruc ? `(${cot.cliente.ruc})` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {formatCurrencyWithSymbol(cot.total, cot.moneda?.simbolo)}
                  </td>
                  {/* <td className="px-4 py-3 text-muted-foreground">
                    {cot.estado_cotizacion?.nombre_estado ?? "-"}
                  </td> */}
                  <td className="px-4 py-3">
                    <StatusBadge active={cot.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/cotizaciones/${cot.id_cotizacion}/pdf`}>
                        <Button variant="secondary">
                          Ver PDF
                        </Button>
                      </Link>
                      <Link href={`/cotizaciones/${cot.id_cotizacion}`}>
                        <Button variant="ghost">
                          Editar
                        </Button>
                      </Link>
                      {canDeleteCotizacion(cot.estado_cotizacion?.nombre_estado) ? (
                        <Button
                          variant="danger"
                          disabled={busyId === cot.id_cotizacion}
                          onClick={() => handleDelete(cot.id_cotizacion)}
                        >
                          {busyId === cot.id_cotizacion ? "..." : "Eliminar"}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pie de página con totales por moneda */}
        <div className="flex flex-wrap gap-6 justify-end px-4 py-3 border-t border-border bg-surface-strong text-sm font-semibold sticky bottom-0 z-10">
          <ExportButtons cotizaciones={cotizaciones} />
          {cotizaciones.length > 0 && Object.entries(
            cotizaciones.reduce((acc, cot) => {
              const simbolo = cot.moneda?.simbolo || cot.moneda?.nombre_moneda || "";
              if (!simbolo) return acc;
              acc[simbolo] = (acc[simbolo] || 0) + (cot.total || 0);
              return acc;
            }, {} as Record<string, number>)
          ).map(([simbolo, total]) => (
            <span key={simbolo}>
              Total {simbolo}: {formatCurrency(total)}
            </span>
          ))}
        </div>
        {cotizaciones.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No hay cotizaciones registradas aún.
          </div>
        )}
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCurrencyWithSymbol(value: number, symbol?: string | null) {
  const formatted = formatCurrency(value);
  return symbol ? `${symbol} ${formatted}` : formatted;
}

function formatPeruDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) {
    return dateValue;
  }

  const safeDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return safeDate.toLocaleDateString("es-PE", { timeZone: "America/Lima" });
}

function canDeleteCotizacion(estadoNombre: string | undefined) {
  return (estadoNombre ?? "").trim().toUpperCase() !== "GRABADO";
}
