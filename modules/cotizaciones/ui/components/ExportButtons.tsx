"use client";
import React, { useState, useEffect } from "react";

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

function formatCurrency(value: number) {
  return value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPeruDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) {
    return dateValue;
  }
  const safeDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return safeDate.toLocaleDateString("es-PE", { timeZone: "America/Lima" });
}

interface ExportButtonsProps {
  cotizaciones: CotizacionListItem[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ cotizaciones }) => {
  const [isClient, setIsClient] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const exportToPDF = async () => {
    if (!isClient) return;
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Fecha", "Cliente", "Total", "Moneda", "Activo"]],
      body: cotizaciones.map(cot => [
        formatPeruDate(cot.fecha),
        cot.cliente?.nombre ?? "-",
        formatCurrency(cot.total),
        cot.moneda?.simbolo || cot.moneda?.nombre_moneda || "",
        cot.estado ? "Sí" : "No"
      ]),
    });
    doc.save("cotizaciones.pdf");
    setMessage("Resultados exportados a PDF");
    setTimeout(() => setMessage(null), 2500);
  };

  const exportToExcel = async () => {
    if (!isClient) return;
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(
      cotizaciones.map(cot => ({
        Fecha: formatPeruDate(cot.fecha),
        Cliente: cot.cliente?.nombre ?? "-",
        Total: cot.total,
        Moneda: cot.moneda?.simbolo || cot.moneda?.nombre_moneda || "",
        Activo: cot.estado ? "Sí" : "No"
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cotizaciones");
    XLSX.writeFile(wb, "cotizaciones.xlsx");
    setMessage("Resultados exportados a Xls");
    setTimeout(() => setMessage(null), 2500);
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-2 mr-auto">
      {message && (
        <div className="rounded bg-emerald-50 px-3 py-1 text-sm text-success w-fit">
          {message}
        </div>
      )}
      <div className="flex gap-8">
        <button type="button" className="btn btn-sm btn-primary" onClick={exportToPDF}>
          Exportar PDF
        </button>
        <button type="button" className="btn btn-sm btn-secondary" onClick={exportToExcel}>
          Exportar Excel
        </button>
      </div>
    </div>
  );
};

export default ExportButtons;
