
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";

type ClienteRow = Database["public"]["Tables"]["cliente"]["Row"];
type ClienteInsert = Database["public"]["Tables"]["cliente"]["Insert"];
type ClienteUpdate = Database["public"]["Tables"]["cliente"]["Update"];

export async function listClientes(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("cliente")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies ClienteRow[];
}

export async function getClienteById(supabase: SupabaseClient<Database>, idCliente: string) {
  const { data, error } = await supabase
    .from("cliente")
    .select("*")
    .eq("id_cliente", idCliente)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies ClienteRow;
}

export async function createCliente(supabase: SupabaseClient<Database>, payload: ClienteInsert) {
  const { data, error } = await supabase.from("cliente").insert([payload]).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies ClienteRow;
}


export async function updateCliente(
  supabase: SupabaseClient<Database>,
  idCliente: string,
  payload: ClienteUpdate
) {
  const { data, error } = await supabase
    .from("cliente")
    .update([payload])
    .eq("id_cliente", idCliente)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies ClienteRow;
}

export async function deleteCliente(supabase: SupabaseClient<Database>, idCliente: string) {
  const { error } = await supabase.from("cliente").delete().eq("id_cliente", idCliente);

  if (error) {
    throw new Error(error.message);
  }
}
