
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
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
  // Cargar imagen de pie de página
  let piePaginaImage: undefined | import("pdf-lib").PDFImage;
  try {
    const piePaginaPath = path.join(process.cwd(), "public", "assets", "PiePagina.png");
    const piePaginaBuffer = await fs.readFile(piePaginaPath);
    piePaginaImage = await pdf.embedPng(piePaginaBuffer);
  } catch {}

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const selectedCurrencySymbol =
    cotizacion.moneda?.simbolo ?? currencySymbol(cotizacion.moneda?.nombre_moneda);

  // Función para asegurar espacio en la página
  const ensureSpace = (requiredHeight: number) => {
    if (cursorY - requiredHeight > MARGIN) return;
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cursorY = PAGE_HEIGHT - MARGIN;
  };

  // Función para dibujar una línea horizontal
  const drawLine = (y: number) => {
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1,
      color: BORDER_COLOR,
    });
  };

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - MARGIN;

  // Función para dibujar texto con alineación
  const drawText = (text: string, x: number, y: number, options?: { size?: number; color?: ReturnType<typeof rgb>; bold?: boolean; align?: 'left' | 'center' | 'right' }) => {
    let drawX = x;
    if (options?.align === 'center') {
      const textWidth = (options?.bold ? bold : font).widthOfTextAtSize(text, options?.size ?? 10);
      drawX = x - textWidth / 2;
    } else if (options?.align === 'right') {
      const textWidth = (options?.bold ? bold : font).widthOfTextAtSize(text, options?.size ?? 10);
      drawX = x - textWidth;
    }
    page.drawText(text, {
      x: drawX,
      y,
      size: options?.size ?? 10,
      font: options?.bold ? bold : font,
      color: options?.color ?? rgb(0, 0, 0),
    });
  };

  // Cargar imágenes (logo y máquina) usando fs/promises
  let logoImage, machineImage;
  try {
    const logoPath = path.join(process.cwd(), "public", "assets", "logo.png");
    const logoBuffer = await fs.readFile(logoPath);
    logoImage = await pdf.embedPng(logoBuffer);
  } catch {}
  try {
    const machinePath = path.join(process.cwd(), "public", "assets", "Maquina.png");
    const machineBuffer = await fs.readFile(machinePath);
    machineImage = await pdf.embedPng(machineBuffer);
  } catch {}

  // --- CABECERA FORMATO AGH ---
  // Logo AGH a la izquierda
  const logoWidth = 60;
  const logoHeight = 60;
  const logoY = cursorY - 30;
  if (logoImage) {
    page.drawImage(logoImage, {
      x: MARGIN,
      y: logoY,
      width: logoWidth,
      height: logoHeight,
    });
  } else {
    page.drawRectangle({ x: MARGIN, y: logoY, width: logoWidth, height: logoHeight, color: rgb(0,0,0) });
    drawText("LOGO", MARGIN + 18, logoY + 35, { size: 16, color: rgb(1,1,1), bold: true });
  }

  // Número de cotización debajo del logo
  // El logo está en (MARGIN, logoY) con altura logoHeight
  const cotizacionY = logoY - 18; // 18 puntos debajo del borde inferior del logo
  drawText(`N° ${cotizacionCode(cotizacion)}`, MARGIN, cotizacionY, { size: 12, bold: true, color: HEADER_COLOR });

  // Nombre empresa centrado (tamaño 11pt, más abajo)
  drawText("AGH ACEROS Y AFINES E.I.R.L.", PAGE_WIDTH / 2, cursorY + 25, { size: 11, bold: true, align: 'center' });

  // Descripción de servicios (centrado, varias líneas, tamaño 8pt, ancho limitado)
  const servicios = [
    "SERVICIO DE CORTE LASER EN PLANCHAS LAC, LAF, INOXIDABLE, ALUMINIO, COBRE Y BRONCE,",
    "DOBLEZ DE PLANCHAS A 3M DE LONGITUD, SERVICIO DE TROQUELADO SEGÚN MEDIDAS, ROLADO",
    "DE PLANCHAS, LAF, LAC E INOXIDABLE"
  ];
  // Limitar el ancho para que no se solape con logo/maquina (dejar margen de 80px a cada lado)
  const maxTextWidth = PAGE_WIDTH - 2 * (MARGIN + 80);
  const offsetX = 0; // Centrado, pero puedes ajustar a un valor positivo si quieres más a la derecha
  const newMargin = MARGIN + 40; // Aumentar el margen para más espacio de texto
  const newMaxTextWidth = PAGE_WIDTH - 2 * newMargin;
  servicios.forEach((linea, i) => {
    // Si la línea es muy larga, recortarla y agregar "..."
    let text = linea;
    const fontSize = 7;
    const textWidth = bold.widthOfTextAtSize(text, fontSize);
    if (textWidth > newMaxTextWidth) {
      // Recortar y agregar "..."
      let len = text.length;
      while (len > 0 && bold.widthOfTextAtSize(text.slice(0, len) + '...', fontSize) > newMaxTextWidth) {
        len--;
      }
      text = text.slice(0, len) + '...';
    }
    drawText(text, PAGE_WIDTH / 2 + offsetX, cursorY + 15 - i * 11, { size: fontSize, align: 'center' });
  });

  // Imagen máquina a la derecha
  const machineX = PAGE_WIDTH - MARGIN - 80;
  const machineY = cursorY - 10;
  if (machineImage) {
    page.drawImage(machineImage, {
      x: machineX,
      y: machineY,
      width: 80,
      height: 40,
    });
  } else {
    page.drawRectangle({ x: machineX, y: machineY, width: 80, height: 40, color: rgb(0.7,0.7,0.7) });
    drawText("MÁQUINA", machineX + 20, machineY + 15, { size: 10, color: rgb(0.2,0.2,0.2), bold: true });
  }

  // (Eliminado: el número de cotización solo se muestra debajo del logo)

  // Datos de contacto (alineados a la derecha, debajo de la máquina)
  const contactoX = PAGE_WIDTH - MARGIN - 5;
  const contactoY = machineY - 8; // justo debajo de la imagen de la máquina
  drawText("RUC 20605387544", contactoX, contactoY, { size: 8, align: 'right' });
  drawText("Cel. 934682181", contactoX, contactoY - 11, { size: 8, align: 'right' });
  drawText("g.lagos@agh-acerosyafines.com", contactoX, contactoY - 22, { size: 8, align: 'right' });
  drawText("Psje Los Ingleses Nro. 155 Urb. Astete", contactoX, contactoY - 33, { size: 8, align: 'right' });
  drawText("Las Perla - Callao", contactoX, contactoY - 44, { size: 8, align: 'right' });

  cursorY -= 70;
  drawLine(cursorY);
  cursorY -= 18;
  // --- FIN CABECERA ---


  // --- DATOS DEL CLIENTE ---
  drawText("Cliente", MARGIN, cursorY, { size: 10, bold: true, color: HEADER_COLOR });
  cursorY -= 16;
  drawText(cotizacion.cliente?.nombre ?? "Sin cliente", MARGIN, cursorY, { size: 12, bold: true });
  cursorY -= 14;
  drawText(`RUC: ${cotizacion.cliente?.ruc ?? "-"}`, MARGIN, cursorY, { color: MUTED_COLOR });
  cursorY -= 20;


  // --- DATOS DE COTIZACION EN UNA SOLA LINEA ---
  const datosLinea = [
    { label: "Tipo de pago", value: cotizacion.tipo_pago?.forma_pago ?? "-" },
    { label: "Validez (días)", value: cotizacion.validez_dias?.toString() ?? "-" },
    { label: "Entrega (horas)", value: cotizacion.entrega_horas?.toString() ?? "-" },
    { label: "Estado", value: cotizacion.estado_cotizacion?.nombre_estado ?? "-" },
    { label: "Moneda", value: cotizacion.moneda?.nombre_moneda ?? "-" },
  ];
  const colWidth = (PAGE_WIDTH - 2 * MARGIN) / datosLinea.length;
  let filaY = cursorY;
  datosLinea.forEach((dato, idx) => {
    drawText(dato.label, MARGIN + idx * colWidth, filaY, { size: 9, color: HEADER_COLOR, bold: true });
    drawText(dato.value, MARGIN + idx * colWidth, filaY - 12, { size: 10 });
  });
  cursorY = filaY - 36; // Más espacio para evitar solapamiento con la cabecera del detalle

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

  const descX = MARGIN + 48;
  const descYPad = 8; // padding superior para la descripción
  const descWidth = 260; // ancho máximo de la columna descripción (más reducido)
  const descFontSize = 9;
  cotizacion.detalles.forEach((detalle) => {
    // Dividir la descripción en líneas que quepan en el ancho de la columna
    const words = detalle.descripcion.split(' ');
    let lines: string[] = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = bold.widthOfTextAtSize(testLine, descFontSize);
      if (testWidth > descWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const rowHeight = 16 + (lines.length - 1) * 12;
    ensureSpace(rowHeight + 8);
    drawLine(cursorY + 4);
    drawText(String(detalle.correlativo), MARGIN + 8, cursorY - 8, { size: descFontSize });

    // Dibujar cada línea de la descripción
    lines.forEach((line, i) => {
      drawText(line, descX, cursorY - 8 - i * 12, { size: descFontSize });
    });
    // Solo la primera línea lleva los otros campos, las demás solo la descripción
    drawText(money(detalle.cantidad), 374, cursorY - 8, { size: descFontSize });
    drawText(moneyWithSymbol(detalle.precio_unitario, selectedCurrencySymbol), 428, cursorY - 8, { size: descFontSize });
    drawText(moneyWithSymbol(detalle.total, selectedCurrencySymbol), 502, cursorY - 8, { size: descFontSize });
    cursorY -= (lines.length * 12) + 12;
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
    ["Detraccion (" + detraccionPercent.toFixed(2) + "%)", moneyWithSymbol(cotizacion.detraccion, selectedCurrencySymbol)],
    ["Total", moneyWithSymbol(cotizacion.total, selectedCurrencySymbol)],
  ];

  totalRows.forEach(([label, value], index) => {
    drawText(label, labelX, cursorY, { bold: label === "Total", color: label === "Total" ? HEADER_COLOR : MUTED_COLOR });
    drawText(value, valueX, cursorY, { bold: label === "Total" });
    cursorY -= index === totalRows.length - 1 ? 24 : 16;
  });

  cursorY -= 10;
  drawLine(cursorY);
  cursorY -= 18;

  // Función para dibujar el pie de página en una página dada
  const drawPiePagina = (targetPage: import("pdf-lib").PDFPage) => {
    if (piePaginaImage) {
      const pieWidth = PAGE_WIDTH - 2 * MARGIN;
      // Mantener la relación de aspecto de la imagen
      const aspect = piePaginaImage.height / piePaginaImage.width;
      const pieHeight = pieWidth * aspect;
      // Subir el pie de página 20 puntos más arriba
      targetPage.drawImage(piePaginaImage, {
        x: MARGIN,
        y: MARGIN + 20, // antes: MARGIN - pieHeight + 10
        width: pieWidth,
        height: pieHeight,
      });
    }
  };

  // Dibujar pie de página en todas las páginas
  const allPages = pdf.getPages();
  for (const p of allPages) {
    drawPiePagina(p);
  }

  return pdf.save();
}
