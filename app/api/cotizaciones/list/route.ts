import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin-client";
import { listCotizaciones } from "@/modules/cotizaciones/infrastructure/cotizacion.repository";

export async function GET(req: NextRequest) {
  const supabase = createAdminSupabaseClient();
  const { searchParams } = new URL(req.url);
  const clienteId = searchParams.get("clienteId") ?? undefined;
  const fechaDesde = searchParams.get("fechaDesde") ?? undefined;
  const fechaHasta = searchParams.get("fechaHasta") ?? undefined;
  const monedaId = searchParams.get("monedaId") ?? undefined;

  // Llama la función con filtros
  const cotizaciones = await listCotizaciones(supabase, {
    clienteId,
    fechaDesde,
    fechaHasta,
    monedaId,
  });
  return NextResponse.json(cotizaciones ?? []);
}
