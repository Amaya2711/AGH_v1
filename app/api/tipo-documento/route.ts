import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/services/supabase/server-client";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tipo_documento")
    .select("id_tipodoc, nombre_documento")
    .order("nombre_documento", { ascending: true });
  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(
    (data || []).map((t) => ({ value: t.id_tipodoc, label: t.nombre_documento }))
  );
}
