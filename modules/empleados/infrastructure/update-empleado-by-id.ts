import { createServerSupabaseClient } from "@/services/supabase/server-client";
import type { Empleado } from "@/modules/empleados/domain/empleado";

export async function updateEmpleadoById(id: string, data: Partial<Empleado>) {
  const supabase = await createServerSupabaseClient();
  const payload = {
    ...data,
    telefono: data.telefono ?? null,
  };
  const { error } = await supabase
    .from("empleado")
    .update(payload)
    .eq("id_empleado", id);
  if (error) throw error;
}
