import { createServerSupabaseClient } from "@/services/supabase/server-client";
import type { Database } from "@/types/database";

// @ts-ignore
export async function updateEmpleadoById(id: string, data: any) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("empleado")
    .update(data)
    .eq("id_empleado", id);
  if (error) throw error;
}
