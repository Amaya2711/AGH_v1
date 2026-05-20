
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClienteInsert, ClienteRow, ClienteUpdate } from "@/modules/clientes/domain/types";

export async function listClientes(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("cliente")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ClienteRow[];
}

export async function getClienteById(supabase: SupabaseClient, idCliente: string) {
  const { data, error } = await supabase
    .from("cliente")
    .select("*")
    .eq("id_cliente", idCliente)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ClienteRow;
}

export async function createCliente(supabase: SupabaseClient, payload: ClienteInsert) {
  const { data, error } = await supabase.from("cliente").insert([payload]).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ClienteRow;
}


export async function updateCliente(
  supabase: SupabaseClient,
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

  return data as ClienteRow;
}

export async function deleteCliente(supabase: SupabaseClient, idCliente: string) {
  const { error } = await supabase.from("cliente").delete().eq("id_cliente", idCliente);

  if (error) {
    throw new Error(error.message);
  }
}
