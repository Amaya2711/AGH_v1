import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.generated";
import type {
  CotizacionConDetalle,
  CotizacionDocumento,
  CotizacionInsert,
  CotizacionRow,
  CotizacionUpdate,
  DetraccionOption,
  DetalleCotizacionInsert,
} from "@/modules/cotizaciones/domain/types";

type DetraccionRaw = Record<string, unknown>;

type DatabaseWithDetraccion = {
  public: {
    Tables: Database["public"]["Tables"] & {
      detraccion: {
        Row: DetraccionRaw;
        Insert: DetraccionRaw;
        Update: DetraccionRaw;
        Relationships: [];
      };
    };
    Views: Database["public"]["Views"];
    Functions: Database["public"]["Functions"];
    Enums: Database["public"]["Enums"];
    CompositeTypes: Database["public"]["CompositeTypes"];
  };
};

function parseDetraccionOption(row: DetraccionRaw, index: number): DetraccionOption | null {
  const idRaw = row.id_detraccion ?? row.id ?? row.codigo ?? row.id_tipo_detraccion;
  const id = typeof idRaw === "string" ? idRaw : String(idRaw ?? `DET-${index + 1}`);

  const nombreRaw =
    row.nombre_detraccion ?? row.nombre ?? row.descripcion ?? row.tipo_detraccion ?? row.detalle;
  const nombre = typeof nombreRaw === "string" && nombreRaw.trim().length > 0
    ? nombreRaw
    : `Detraccion ${index + 1}`;

  const porcentajeRaw = row.porcentaje ?? row.porcentaje_detraccion ?? row.tasa ?? row.valor ?? row.monto;
  const parsed = Number(porcentajeRaw);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  const porcentaje = parsed > 1 ? parsed / 100 : parsed;
  return {
    id,
    nombre,
    porcentaje,
  };
}

// ── Lookups ─────────────────────────────────────────────────────────────────

export async function listClientesActivos(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("cliente")
    .select("id_cliente, nombre, ruc")
    .eq("estado", true)
    .order("nombre");

  if (error) throw new Error(error.message);
  return data;
}

export async function listMonedas(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("moneda")
    .select("id_moneda, nombre_moneda, simbolo, estado")
    .eq("estado", true)
    .order("nombre_moneda");

  if (error) throw new Error(error.message);
  return data;
}

export async function listTiposPago(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("tipo_pago")
    .select("id_tipo, forma_pago, estado")
    .eq("estado", true)
    .order("forma_pago");

  if (error) throw new Error(error.message);
  return data;
}

export async function listEstados(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("estado")
    .select("id_estado, nombre_estado, estado")
    .eq("estado", true)
    .order("id_estado");

  if (error) throw new Error(error.message);
  return data;
}

export async function listDetracciones(supabase: SupabaseClient<Database>) {
  const supabaseWithDetraccion = supabase as unknown as SupabaseClient<DatabaseWithDetraccion>;

  const { data, error } = await supabaseWithDetraccion
    .from("detraccion")
    .select("*");

  if (error) throw new Error(error.message);

  return ((data ?? []) as DetraccionRaw[])
    .map(parseDetraccionOption)
    .filter((item): item is DetraccionOption => item !== null);
}

// ── Cotizaciones ─────────────────────────────────────────────────────────────

export async function listCotizaciones(
  supabase: SupabaseClient<Database>,
  filtros?: { clienteId?: string; fechaDesde?: string; fechaHasta?: string; monedaId?: string }
) {
  let query = supabase.from("cotizacion").select("*").order("created_at", { ascending: false });
  if (filtros?.clienteId) {
    query = query.eq("id_cliente", filtros.clienteId);
  }
  if (filtros?.fechaDesde) {
    query = query.gte("fecha", filtros.fechaDesde);
  }
  if (filtros?.fechaHasta) {
    query = query.lte("fecha", filtros.fechaHasta);
  }
  if (filtros?.monedaId) {
    query = query.eq("id_moneda", filtros.monedaId);
  }

  const { data: cotizaciones, error } = await query;
  if (error) throw new Error(error.message);

  const clienteIds = Array.from(new Set((cotizaciones ?? []).map((item) => item.id_cliente)));
  const monedaIds = Array.from(new Set((cotizaciones ?? []).map((item) => item.id_moneda)));
  const estadoIds = Array.from(new Set((cotizaciones ?? []).map((item) => item.id_estado)));

  const [clientesRes, monedasRes, estadosRes] = await Promise.all([
    clienteIds.length > 0
      ? supabase
          .from("cliente")
          .select("id_cliente, nombre, ruc")
          .in("id_cliente", clienteIds)
      : Promise.resolve({ data: [], error: null }),
    monedaIds.length > 0
      ? supabase
          .from("moneda")
          .select("id_moneda, nombre_moneda, simbolo")
          .in("id_moneda", monedaIds)
      : Promise.resolve({ data: [], error: null }),
    estadoIds.length > 0
      ? supabase
          .from("estado")
          .select("id_estado, nombre_estado")
          .in("id_estado", estadoIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (clientesRes.error) throw new Error(clientesRes.error.message);
  if (monedasRes.error) throw new Error(monedasRes.error.message);
  if (estadosRes.error) throw new Error(estadosRes.error.message);

  const clientesById = new Map((clientesRes.data ?? []).map((item) => [item.id_cliente, item]));
  const monedasById = new Map((monedasRes.data ?? []).map((item) => [item.id_moneda, item]));
  const estadosById = new Map((estadosRes.data ?? []).map((item) => [item.id_estado, item]));

  return (cotizaciones ?? []).map((item) => ({
    ...item,
    cliente: clientesById.get(item.id_cliente) ?? null,
    moneda: monedasById.get(item.id_moneda) ?? null,
    estado_cotizacion: estadosById.get(item.id_estado) ?? null,
  }));
}

export async function getCotizacionById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<CotizacionConDetalle> {
  const [cotizacionRes, detalleRes] = await Promise.all([
    supabase
      .from("cotizacion")
      .select(
        `*,
         cliente:id_cliente ( id_cliente, nombre, ruc )`
      )
      .eq("id_cotizacion", id)
      .single(),
    supabase
      .from("detalle_cotizacion")
      .select("*")
      .eq("id_cotizacion", id)
      .order("correlativo"),
  ]);

  if (cotizacionRes.error) throw new Error(cotizacionRes.error.message);
  if (detalleRes.error) throw new Error(detalleRes.error.message);

  const raw = cotizacionRes.data as CotizacionRow & {
    cliente: CotizacionConDetalle["cliente"];
  };

  return {
    ...raw,
    detalles: detalleRes.data,
  };
}

export async function getCotizacionDocumentoById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<CotizacionDocumento> {
  const [cotizacionRes, detalleRes] = await Promise.all([
    supabase
      .from("cotizacion")
      .select("*")
      .eq("id_cotizacion", id)
      .single(),
    supabase
      .from("detalle_cotizacion")
      .select("*")
      .eq("id_cotizacion", id)
      .order("correlativo"),
  ]);

  if (cotizacionRes.error) throw new Error(cotizacionRes.error.message);
  if (detalleRes.error) throw new Error(detalleRes.error.message);

  const cotizacion = cotizacionRes.data;

  const [clienteRes, monedaRes, tipoPagoRes, estadoRes] = await Promise.all([
    supabase
      .from("cliente")
      .select("id_cliente, nombre, ruc")
      .eq("id_cliente", cotizacion.id_cliente)
      .maybeSingle(),
    supabase
      .from("moneda")
      .select("id_moneda, nombre_moneda, simbolo")
      .eq("id_moneda", cotizacion.id_moneda)
      .maybeSingle(),
    supabase
      .from("tipo_pago")
      .select("id_tipo, forma_pago")
      .eq("id_tipo", cotizacion.id_pago)
      .maybeSingle(),
    supabase
      .from("estado")
      .select("id_estado, nombre_estado")
      .eq("id_estado", cotizacion.id_estado)
      .maybeSingle(),
  ]);

  if (clienteRes.error) throw new Error(clienteRes.error.message);
  if (monedaRes.error) throw new Error(monedaRes.error.message);
  if (tipoPagoRes.error) throw new Error(tipoPagoRes.error.message);
  if (estadoRes.error) throw new Error(estadoRes.error.message);

  return {
    ...(cotizacion as CotizacionRow),
    cliente: clienteRes.data,
    moneda: monedaRes.data,
    tipo_pago: tipoPagoRes.data,
    estado_cotizacion: estadoRes.data,
    detalles: detalleRes.data,
  };
}

export async function createCotizacion(
  supabase: SupabaseClient<Database>,
  header: CotizacionInsert,
  detalles: Omit<DetalleCotizacionInsert, "id_cotizacion">[]
): Promise<CotizacionRow> {
  const { data: cotizacion, error: cotError } = await supabase
    .from("cotizacion")
    .insert(header)
    .select("*")
    .single();

  if (cotError) throw new Error(cotError.message);

  const itemsToInsert: DetalleCotizacionInsert[] = detalles.map((d, i) => ({
    ...d,
    id_cotizacion: cotizacion.id_cotizacion,
    correlativo: i + 1,
  }));

  const { error: detError } = await supabase
    .from("detalle_cotizacion")
    .insert(itemsToInsert);

  if (detError) throw new Error(detError.message);

  return cotizacion satisfies CotizacionRow;
}

export async function updateCotizacion(
  supabase: SupabaseClient<Database>,
  id: string,
  header: CotizacionUpdate,
  detalles: Omit<DetalleCotizacionInsert, "id_cotizacion">[]
): Promise<CotizacionRow> {
  const { data: cotizacion, error: cotError } = await supabase
    .from("cotizacion")
    .update(header)
    .eq("id_cotizacion", id)
    .select("*")
    .single();

  if (cotError) throw new Error(cotError.message);

  // Replace all detalles
  const { error: delError } = await supabase
    .from("detalle_cotizacion")
    .delete()
    .eq("id_cotizacion", id);

  if (delError) throw new Error(delError.message);

  const itemsToInsert: DetalleCotizacionInsert[] = detalles.map((d, i) => ({
    ...d,
    id_cotizacion: id,
    correlativo: i + 1,
  }));

  const { error: insError } = await supabase
    .from("detalle_cotizacion")
    .insert(itemsToInsert);

  if (insError) throw new Error(insError.message);

  return cotizacion satisfies CotizacionRow;
}

export async function deleteCotizacion(
  supabase: SupabaseClient<Database>,
  id: string
) {
  // FK cascade should handle detalles; if not, delete manually first
  const { error: detError } = await supabase
    .from("detalle_cotizacion")
    .delete()
    .eq("id_cotizacion", id);

  if (detError) throw new Error(detError.message);

  const { error } = await supabase
    .from("cotizacion")
    .delete()
    .eq("id_cotizacion", id);

  if (error) throw new Error(error.message);
}
