
import { getEmpleadoById } from "@/modules/empleados/infrastructure/get-empleado-by-id";
import { updateEmpleadoById } from "@/modules/empleados/infrastructure/update-empleado-by-id";
import { createServerSupabaseClient } from "@/services/supabase/server-client";
import { EmpleadoForm } from "@/modules/empleados/ui/forms/empleado-form";

interface EditarEmpleadoPageProps {
  params: { id: string };
}

export default async function EditarEmpleadoPage({ params }: EditarEmpleadoPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const empleado = await getEmpleadoById(supabase, id);

  async function handleSubmit(data: any) {
    "use server";
    await updateEmpleadoById(id, data);
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">EMPLEADOS</p>
        <h2 className="text-3xl font-bold text-foreground">Editar Empleado</h2>
      </div>
      <EmpleadoForm mode="edit" initialData={empleado} onSubmit={handleSubmit} />
    </section>
  );
}
