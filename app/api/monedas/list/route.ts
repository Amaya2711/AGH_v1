import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin-client";

export async function GET() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("moneda")
    .select("id_moneda, nombre_moneda, simbolo")
    .eq("estado", true)
    .order("nombre_moneda");

  if (error) {
    return NextResponse.json([], { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
