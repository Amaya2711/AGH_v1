import { NextResponse } from "next/server";

import { clienteSchema } from "@/modules/clientes/domain/schemas/cliente.schema";
import { deleteCliente, updateCliente } from "@/modules/clientes/infrastructure/cliente.repository";
import { getServerAuthSession } from "@/services/auth/session";
import { createServerSupabaseClient } from "@/services/supabase/server-client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const cliente = await updateCliente(supabase, id, {
      nombre: parsed.data.nombre,
      ruc: parsed.data.ruc,
      direccion: parsed.data.direccion || null,
      telefono: parsed.data.telefono || null,
      estado: parsed.data.estado,
    });

    return NextResponse.json(cliente, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error al actualizar cliente" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerAuthSession();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    await deleteCliente(supabase, id);
    return NextResponse.json({ message: "Cliente eliminado" }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error al eliminar cliente" }, { status: 500 });
  }
}
