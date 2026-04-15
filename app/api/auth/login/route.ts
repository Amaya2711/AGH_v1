import { NextResponse } from "next/server";
import { z } from "zod";

import { setAuthSession } from "@/services/auth/session";
import { createAdminSupabaseClient } from "@/services/supabase/admin-client";

const loginSchema = z.object({
  nombre_usuario: z.string().min(1, "El usuario es obligatorio"),
  clave: z.string().min(1, "La clave es obligatoria"),
});
// Definición del tipo Usuario para tipar la respuesta de Supabase
type Usuario = {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  clave: string;
  estado: boolean;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Datos invalidos" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data: usuario, error } = await supabase
      .from("usuario")
      .select("id_usuario, nombre_usuario, correo, clave, estado")
      .eq("nombre_usuario", parsed.data.nombre_usuario)
      .single<Usuario>();

    if (error || !usuario || !usuario.estado || usuario.clave !== parsed.data.clave) {
      return NextResponse.json({ message: "Credenciales incorrectas" }, { status: 401 });
    }

    const response = NextResponse.json({ message: "Ingreso correcto" }, { status: 200 });
    setAuthSession(response, {
      userId: String(usuario.id_usuario),
      username: usuario.nombre_usuario,
      email: usuario.correo,
      issuedAt: Date.now(),
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Error al iniciar sesion" }, { status: 500 });
  }
}
