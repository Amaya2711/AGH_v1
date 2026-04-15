import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin-client";

export async function GET() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("cliente")
    .select("id_cliente, nombre, ruc")
    .eq("estado", true)
    .order("nombre");

  if (error) {
    return NextResponse.json([], { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
