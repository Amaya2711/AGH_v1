import { NextResponse } from "next/server";

import { clienteSchema } from "@/modules/clientes/domain/schemas/cliente.schema";
import { createCliente, listClientes } from "@/modules/clientes/infrastructure/cliente.repository";
import { getServerAuthSession } from "@/services/auth/session";
import { createServerSupabaseClient } from "@/services/supabase/server-client";

export async function GET() {
  try {
    const user = await getServerAuthSession();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const clientes = await listClientes(supabase);
    return NextResponse.json(clientes, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error al listar clientes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerAuthSession();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    const parsed = clienteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validacion incorrecta",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const cliente = await createCliente(supabase, {
      nombre: parsed.data.nombre,
      ruc: parsed.data.ruc,
      direccion: parsed.data.direccion || null,
      telefono: parsed.data.telefono || null,
      estado: parsed.data.estado,
      created_by: user.userId,
      updated_by: user.userId,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error al crear cliente" }, { status: 500 });
  }
}
