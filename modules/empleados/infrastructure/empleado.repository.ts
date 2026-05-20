import { createServerSupabaseClient } from "@/services/supabase/server-client";
import type { Empleado } from "@/modules/empleados/domain/empleado";

export async function listEmpleados(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data, error } = await supabase
    .from("empleado")
    .select("*")
    .order("nombre_empleado", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Empleado[];
}
