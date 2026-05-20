import type { Database } from "@/types/database.generated";

export type CotizacionRow = Database["_public"]["Tables"]["cotizacion"]["Row"];
export type CotizacionInsert = Database["_public"]["Tables"]["cotizacion"]["Insert"];
export type CotizacionUpdate = Database["_public"]["Tables"]["cotizacion"]["Update"];

export type DetalleCotizacionRow =
  Database["public"]["Tables"]["detalle_cotizacion"]["Row"];
export type DetalleCotizacionInsert =
  Database["public"]["Tables"]["detalle_cotizacion"]["Insert"];

export type MonedaRow = Database["public"]["Tables"]["moneda"]["Row"];
export type TipoPagoRow = Database["public"]["Tables"]["tipo_pago"]["Row"];
export type EstadoRow = Database["public"]["Tables"]["estado"]["Row"];
export type ClienteRow = Database["public"]["Tables"]["cliente"]["Row"];
export type UnidadMedidaRow = Database["public"]["Tables"]["unidad_medida"]["Row"];

export interface DetalleCotizacionWithUnidad extends DetalleCotizacionRow {
  unidad_medida?: Pick<UnidadMedidaRow, "id" | "um" | "abrevia"> | null;
}

export interface CotizacionConDetalle extends CotizacionRow {
  cliente: Pick<ClienteRow, "id_cliente" | "nombre" | "ruc"> | null;
  detalles: DetalleCotizacionWithUnidad[];
}

export interface CotizacionDocumento extends CotizacionConDetalle {
  moneda: Pick<MonedaRow, "id_moneda" | "nombre_moneda" | "simbolo"> | null;
  tipo_pago: Pick<TipoPagoRow, "id_tipo" | "forma_pago"> | null;
  estado_cotizacion: Pick<EstadoRow, "id_estado" | "nombre_estado"> | null;
}

export interface CotizacionDeliveryResult {
  id_cotizacion: string;
  pdfUrl: string;
  emailSent: boolean;
  recipient: string | null;
  emailError?: string;
}

export interface DetraccionOption {
  id: string;
  nombre: string;
  porcentaje: number;
}
