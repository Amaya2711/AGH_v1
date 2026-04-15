

import { EmpleadoForm } from "@/modules/empleados/ui/forms/empleado-form";
import { insertEmpleado } from "@/modules/empleados/infrastructure/insert-empleado";


export default function NuevoEmpleadoPage() {
  async function handleSubmit(data: any) {
    "use server";
    await insertEmpleado(data);
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">EMPLEADOS</p>
        <h2 className="text-3xl font-bold text-foreground">Nuevo Empleado</h2>
      </div>
      <EmpleadoForm mode="create" onSubmit={handleSubmit} />
    </section>
  );
}
