import {
  listClientesActivos,
  listDetracciones,
  listEstados,
  listMonedas,
  listTiposPago,
  listUnidadesMedida,
} from "@/modules/cotizaciones/infrastructure/cotizacion.repository";
import { CotizacionForm } from "@/modules/cotizaciones/ui/forms/cotizacion-form";
import { createAdminSupabaseClient } from "@/services/supabase/admin-client";

export default async function NuevaCotizacionPage() {
  const supabase = createAdminSupabaseClient();

  const [clientes, monedas, tiposPago, estados, detracciones, unidadesMedida] = await Promise.all([
    listClientesActivos(supabase),
    listMonedas(supabase),
    listTiposPago(supabase),
    listEstados(supabase),
    listDetracciones(supabase),
    listUnidadesMedida(supabase),
  ]);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Cotizaciones
        </p>
        <h2 className="text-3xl font-bold text-foreground">Nueva cotizacion</h2>
      </div>
      <CotizacionForm
        mode="create"
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
