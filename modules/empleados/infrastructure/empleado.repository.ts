import { createServerSupabaseClient } from "@/services/supabase/server-client";
import type { Database } from "@/types/database.generated";

export async function listEmpleados(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data, error } = await supabase
    .from("empleado")
    .select("*")
    .order("nombre_empleado", { ascending: true });
  if (error) throw error;
  return data as Database["_public"]["Tables"]["empleado"]["Row"][];
}
