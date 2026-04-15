// Página de gestión de empleados: crear, modificar, inactivar

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { EmpleadosTable } from "@/modules/empleados/ui/components/empleados-table";
import { listEmpleados } from "@/modules/empleados/infrastructure/empleado.repository";
import { createServerSupabaseClient } from "@/services/supabase/server-client";


export default async function EmpleadosPage() {
  const supabase = await createServerSupabaseClient();
  const empleados = await listEmpleados(supabase);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Modulo</p>
          <h2 className="text-3xl font-bold text-foreground">Empleados</h2>
        </div>
        <Link href="/empleados/nuevo">
          <Button>Nuevo empleado</Button>
        </Link>
      </div>
      {empleados.length === 0 ? (
        <EmptyState
          title="No existen empleados registrados"
          description="Crea el primer empleado para iniciar la gestión."
        />
      ) : (
        <EmpleadosTable empleados={empleados} />
      )}
    </section>
  );
}
