import { createServerSupabaseClient } from "@/services/supabase/server-client";
import type { Database } from "@/types/database.generated";

export async function listTipoDocumento() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tipo_documento")
    .select("id_tipodoc, nombre_documento")
    .order("nombre_documento", { ascending: true });
  if (error) throw error;
  return data as Pick<Database["_public"]["Tables"]["tipo_documento"]["Row"], "id_tipodoc" | "nombre_documento">[];
}
