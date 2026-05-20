import { createServerSupabaseClient } from "@/services/supabase/server-client";
import { randomUUID } from "crypto";
import type { Empleado } from "@/modules/empleados/domain/empleado";
import type { Database } from "@/types/database.generated";

export async function insertEmpleado(data: Partial<Empleado>) {
  const supabase = await createServerSupabaseClient();
  const payload: Database["_public"]["Tables"]["empleado"]["Insert"] = {
    id_empleado: randomUUID(),
    nombre_empleado: data.nombre_empleado ?? "",
    id_tipodoc: data.id_tipodoc ?? "",
    nro_documento: data.nro_documento ?? "",
    telefono: data.telefono ?? null,
    estado: data.estado ?? true,
    created_by: data.created_by ?? null,
    updated_at: data.updated_at ?? null,
    updated_by: data.updated_by ?? null,
  };
  const { error } = await supabase
    .from("empleado")
    .insert([payload]);
  if (error) throw error;
}
