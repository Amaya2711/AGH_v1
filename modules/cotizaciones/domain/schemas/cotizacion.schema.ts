import { z } from "zod";

export const detalleSchema = z.object({
  id_cotizacion: z.string().uuid().optional(),
  correlativo: z.number().int().min(1),
  id_um: z.number().int().positive("Seleccione unidad de medida"),
  descripcion: z.string().min(1, "Ingrese una descripción"),
  cantidad: z.number().positive("Cantidad debe ser mayor a 0"),
  precio_unitario: z.number().positive("Precio debe ser mayor a 0"),
  total: z.number().nonnegative(),
  estado: z.boolean(),
});

export const cotizacionSchema = z.object({
  anio: z.number().int().min(2000),
  id_cliente: z.string().uuid("Seleccione un cliente"),
  fecha: z.string().min(1, "Ingrese la fecha"),
  id_pago: z.string().uuid("Seleccione tipo de pago"),
  id_moneda: z.string().uuid("Seleccione moneda"),
  valido_dias: z.number().int().min(1, "Ingrese días de validez"),
  entrega_horas: z.number().int().min(0),
  id_detraccion: z.string().nullable(),
  subtotal: z.number().nonnegative(),
  igv: z.number().nonnegative(),
  total_previo: z.number().nonnegative(),
  detraccion: z.number().nonnegative(),
  total: z.number().nonnegative(),
  dias_credito: z.number().int().min(0).nullable(),
  id_estado: z.number().int(),
  estado: z.boolean(),
  detalles: z
    .array(detalleSchema)
    .min(1, "Agregue al menos un ítem al detalle"),
});

export type CotizacionFormValues = z.infer<typeof cotizacionSchema>;
export type DetalleFormValues = z.infer<typeof detalleSchema>;
