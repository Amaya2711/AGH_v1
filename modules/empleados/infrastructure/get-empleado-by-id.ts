import { createServerSupabaseClient } from "@/services/supabase/server-client";
import type { Empleado } from "@/modules/empleados/domain/empleado";

export async function getEmpleadoById(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, id: string) {
  const { data, error } = await supabase
    .from("empleado")
    .select("*")
    .eq("id_empleado", id)
    .single();
  if (error) throw error;
  return data as Empleado;
}
