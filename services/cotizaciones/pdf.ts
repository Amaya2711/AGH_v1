import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type { CotizacionDocumento } from "@/modules/cotizaciones/domain/types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const HEADER_COLOR = rgb(0.07, 0.25, 0.44);
const MUTED_COLOR = rgb(0.41, 0.45, 0.5);
const BORDER_COLOR = rgb(0.85, 0.88, 0.91);

function money(value: number) {
  return value.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function currencySymbol(nombreMoneda: string | null | undefined) {
  if (!nombreMoneda) return "";

  const normalized = nombreMoneda.toLowerCase();
  if (normalized.includes("sol")) return "S/";
  if (normalized.includes("dolar") || normalized.includes("usd")) return "$";
  if (normalized.includes("euro")) return "EUR";

  return "";
}

function moneyWithSymbol(value: number, symbol: string) {
  return symbol ? `${symbol} ${money(value)}` : money(value);
}

function date(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }

  const safeDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return safeDate.toLocaleDateString("es-PE", { timeZone: "America/Lima" });
}

function cotizacionCode(cotizacion: CotizacionDocumento) {
  return `COT-${cotizacion.anio}-${cotizacion.id_cotizacion.slice(0, 8).toUpperCase()}`;
}

function detraccionPercentage(cotizacion: CotizacionDocumento) {
  if (cotizacion.total_previo <= 0 || cotizacion.detraccion <= 0) {
    return 0;
  }

  return (cotizacion.detraccion / cotizacion.total_previo) * 100;
}

export function getCotizacionPdfFilename(cotizacion: CotizacionDocumento) {
  return `${cotizacionCode(cotizacion)}.pdf`;
}

export async function generateCotizacionPdf(cotizacion: CotizacionDocumento) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const selectedCurrencySymbol =
    cotizacion.moneda?.simbolo ?? currencySymbol(cotizacion.moneda?.nombre_moneda);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - MARGIN;

  const drawText = (text: string, x: number, y: number, options?: { size?: number; color?: ReturnType<typeof rgb>; bold?: boolean }) => {
    page.drawText(text, {
      x,
      y,
      size: options?.size ?? 10,
      font: options?.bold ? bold : font,
      color: options?.color ?? rgb(0, 0, 0),
    });
  };

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY - requiredHeight > MARGIN) return;
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cursorY = PAGE_HEIGHT - MARGIN;
  };

  const drawLine = (y: number) => {
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1,
      color: BORDER_COLOR,
    });
  };

  drawText("AGH ERP", MARGIN, cursorY, { size: 20, bold: true, color: HEADER_COLOR });
  cursorY -= 28;
  drawText("Cotizacion comercial", MARGIN, cursorY, { size: 13, bold: true });
  drawText(cotizacionCode(cotizacion), PAGE_WIDTH - 200, cursorY, { size: 11, bold: true, color: HEADER_COLOR });
  cursorY -= 18;
  drawText(`Fecha: ${date(cotizacion.fecha)}`, MARGIN, cursorY, { color: MUTED_COLOR });
  drawText(`Moneda: ${cotizacion.moneda?.nombre_moneda ?? "-"}`, 220, cursorY, { color: MUTED_COLOR });
  drawText(`Pago: ${cotizacion.tipo_pago?.forma_pago ?? "-"}`, 390, cursorY, { color: MUTED_COLOR });
  cursorY -= 14;
  drawText(`Validez: ${cotizacion.valido_dias} dias`, MARGIN, cursorY, { color: MUTED_COLOR });
  drawText(`Entrega: ${cotizacion.entrega_horas} horas`, 220, cursorY, { color: MUTED_COLOR });
  drawText(`Estado: ${cotizacion.estado_cotizacion?.nombre_estado ?? "-"}`, 390, cursorY, { color: MUTED_COLOR });
  cursorY -= 22;
  drawLine(cursorY);
  cursorY -= 22;

  drawText("Cliente", MARGIN, cursorY, { size: 10, bold: true, color: HEADER_COLOR });
  cursorY -= 16;
  drawText(cotizacion.cliente?.nombre ?? "Sin cliente", MARGIN, cursorY, { size: 12, bold: true });
  cursorY -= 14;
  drawText(`RUC: ${cotizacion.cliente?.ruc ?? "-"}`, MARGIN, cursorY, { color: MUTED_COLOR });
  cursorY -= 26;

  page.drawRectangle({
    x: MARGIN,
    y: cursorY - 8,
    width: PAGE_WIDTH - MARGIN * 2,
    height: 24,
    color: HEADER_COLOR,
  });
  drawText("Item", MARGIN + 8, cursorY, { size: 9, bold: true, color: rgb(1, 1, 1) });
  drawText("Descripcion", MARGIN + 48, cursorY, { size: 9, bold: true, color: rgb(1, 1, 1) });
  drawText("Cant.", 380, cursorY, { size: 9, bold: true, color: rgb(1, 1, 1) });
  drawText("P. Unit.", 435, cursorY, { size: 9, bold: true, color: rgb(1, 1, 1) });
  drawText("Total", 510, cursorY, { size: 9, bold: true, color: rgb(1, 1, 1) });
  cursorY -= 22;

  cotizacion.detalles.forEach((detalle) => {
    ensureSpace(28);
    drawLine(cursorY + 4);
    drawText(String(detalle.correlativo), MARGIN + 8, cursorY - 8, { size: 9 });

    const description = detalle.descripcion.length > 66
      ? `${detalle.descripcion.slice(0, 63)}...`
      : detalle.descripcion;

    drawText(description, MARGIN + 48, cursorY - 8, { size: 9 });
    drawText(money(detalle.cantidad), 374, cursorY - 8, { size: 9 });
    drawText(moneyWithSymbol(detalle.precio_unitario, selectedCurrencySymbol), 428, cursorY - 8, { size: 9 });
    drawText(moneyWithSymbol(detalle.total, selectedCurrencySymbol), 502, cursorY - 8, { size: 9 });
    cursorY -= 24;
  });

  cursorY -= 10;
  ensureSpace(110);
  drawLine(cursorY);
  cursorY -= 24;

  const labelX = 390;
  const valueX = 500;
  const detraccionPercent = detraccionPercentage(cotizacion);
  const totalRows = [
    ["Subtotal", moneyWithSymbol(cotizacion.subtotal, selectedCurrencySymbol)],
    ["IGV", moneyWithSymbol(cotizacion.igv, selectedCurrencySymbol)],
    ["Total previo", moneyWithSymbol(cotizacion.total_previo, selectedCurrencySymbol)],
    [
      `Detraccion (${detraccionPercent.toFixed(2)}%)`,
      moneyWithSymbol(cotizacion.detraccion, selectedCurrencySymbol),
    ],
    ["Total", moneyWithSymbol(cotizacion.total, selectedCurrencySymbol)],
  ] as const;

  totalRows.forEach(([label, value], index) => {
    drawText(label, labelX, cursorY, { bold: label === "Total", color: label === "Total" ? HEADER_COLOR : MUTED_COLOR });
    drawText(value, valueX, cursorY, { bold: label === "Total" });
    cursorY -= index === totalRows.length - 1 ? 24 : 16;
  });

  cursorY -= 10;
  drawLine(cursorY);
  cursorY -= 18;
  drawText(
    "Documento generado automaticamente desde AGH ERP",
    MARGIN,
    cursorY,
    { size: 9, color: MUTED_COLOR }
  );

  return pdf.save();
}
