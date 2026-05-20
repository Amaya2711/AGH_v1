import { notFound } from "next/navigation";

import {
  getCotizacionById,
  listClientesActivos,
  listDetracciones,
  listEstados,
  listMonedas,
  listTiposPago,
  listUnidadesMedida,
} from "@/modules/cotizaciones/infrastructure/cotizacion.repository";
import { CotizacionForm } from "@/modules/cotizaciones/ui/forms/cotizacion-form";
import { createAdminSupabaseClient } from "@/services/supabase/admin-client";

interface EditarCotizacionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarCotizacionPage({ params }: EditarCotizacionPageProps) {
  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const [clientes, monedas, tiposPago, estados, detracciones, unidadesMedida] = await Promise.all([
    listClientesActivos(supabase),
    listMonedas(supabase),
    listTiposPago(supabase),
    listEstados(supabase),
    listDetracciones(supabase),
    listUnidadesMedida(supabase),
  ]);

  let cotizacion;
  try {
    cotizacion = await getCotizacionById(supabase, id);
  } catch {
    notFound();
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Cotizaciones
        </p>
        <h2 className="text-3xl font-bold text-foreground">Editar cotizacion</h2>
      </div>
      <CotizacionForm
        mode="update"
        initialData={cotizacion}
        clientes={clientes ?? []}
        monedas={monedas ?? []}
        tiposPago={tiposPago ?? []}
        estados={estados ?? []}
        detracciones={detracciones ?? []}
        unidadesMedida={unidadesMedida ?? []}
      />
    </section>
  );
}
