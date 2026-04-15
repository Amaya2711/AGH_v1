import { NextResponse } from "next/server";

import { cotizacionSchema } from "@/modules/cotizaciones/domain/schemas/cotizacion.schema";
import {
  deleteCotizacion,
  getCotizacionById,
  updateCotizacion,
} from "@/modules/cotizaciones/infrastructure/cotizacion.repository";
import { getServerAuthSession } from "@/services/auth/session";
import { sendCotizacionByEmail } from "@/services/cotizaciones/delivery";
import { createAdminSupabaseClient } from "@/services/supabase/admin-client";
import type { Database } from "@/types/database";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const user = await getServerAuthSession();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminSupabaseClient();
    const cotizacion = await getCotizacionById(supabase, id);
    return NextResponse.json(cotizacion, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error al obtener cotizacion" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const user = await getServerAuthSession();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminSupabaseClient();
    const body = await request.json();
    const parsed = cotizacionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validacion incorrecta", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { detalles, id_detraccion, ...header } = parsed.data;
    void id_detraccion;
    const now = new Date().toISOString();

    const cotizacion = await updateCotizacion(
      supabase,
      id,
      {
        ...header,
        dias_credito: header.dias_credito ?? null,
        id_estado: header.id_estado !== undefined ? String(header.id_estado) : undefined,
        // updated_by y updated_at eliminados porque no existen en el tipo
      },
      detalles.map((d) => ({
        correlativo: d.correlativo,
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        total: d.total,
        estado: d.estado,
        created_by: user.userId,
        updated_by: user.userId,
        created_at: now,
        updated_at: now,
      }))
    );

    let deliveryResult = {
      emailSent: false,
      recipient: null as string | null,
      emailError: undefined as string | undefined,
    };

    try {
      deliveryResult = await sendCotizacionByEmail(supabase, cotizacion.id_cotizacion, user);
    } catch {
      deliveryResult = {
        emailSent: false,
        recipient: null,
        emailError: "No se pudo enviar el correo automatico.",
      };
    }

    return NextResponse.json(
      {
        id_cotizacion: cotizacion.id_cotizacion,
        pdfUrl: `/cotizaciones/${cotizacion.id_cotizacion}/pdf`,
        emailSent: deliveryResult.emailSent,
        recipient: deliveryResult.recipient,
        emailError: deliveryResult.emailError,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ message: "Error al actualizar cotizacion" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const user = await getServerAuthSession();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminSupabaseClient();

    // Usar el tipo correcto de fila generado por Supabase
    const { data, error } = await supabase
      .from("cotizacion")
      .select("id_estado")
      .eq("id_cotizacion", id)
      .single();
    const cotizacion = data as { id_estado?: string } | null;
    const cotizacionError = error;

    if (cotizacionError || !cotizacion) {
      return NextResponse.json({ message: "Cotizacion no encontrada" }, { status: 404 });
    }

    const { data: estadoData, error: estadoError } = await supabase
      .from("estado")
      .select("nombre_estado")
      .eq("id_estado", cotizacion?.id_estado ?? "")
      .single();

    if (estadoError) {
      return NextResponse.json({ message: "No se pudo validar el estado" }, { status: 500 });
    }

    const nombreEstado = (estadoData as { nombre_estado?: string } | null)?.nombre_estado ?? "";
    if (nombreEstado.trim().toUpperCase() === "GRABADO") {
      return NextResponse.json(
        { message: "No se puede eliminar una cotizacion en estado GRABADO" },
        { status: 409 }
      );
    }

    await deleteCotizacion(supabase, id);
    return NextResponse.json({ message: "Cotizacion eliminada" }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error al eliminar cotizacion" }, { status: 500 });
  }
}
