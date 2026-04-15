import { createServerSupabaseClient } from "@/services/supabase/server-client";
import type { Database } from "@/types/database";
import { randomUUID } from "crypto";

export async function insertEmpleado(data: Omit<Database["public"]["Tables"]["empleado"]["Insert"], "id_empleado">) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("empleado")
    .insert([{ ...data, id_empleado: randomUUID() }]);
  if (error) throw error;
}
