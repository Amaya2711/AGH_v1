import { NextResponse } from "next/server";

import { cotizacionSchema } from "@/modules/cotizaciones/domain/schemas/cotizacion.schema";
import {
  createCotizacion,
  listCotizaciones,
} from "@/modules/cotizaciones/infrastructure/cotizacion.repository";
import { getServerAuthSession } from "@/services/auth/session";
import { sendCotizacionByEmail } from "@/services/cotizaciones/delivery";
import { createAdminSupabaseClient } from "@/services/supabase/admin-client";

export async function GET() {
  try {
    const user = await getServerAuthSession();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();
    const cotizaciones = await listCotizaciones(supabase);
    return NextResponse.json(cotizaciones, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error al listar cotizaciones." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerAuthSession();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

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

    const cotizacion = await createCotizacion(
      supabase,
      {
        ...header,
        dias_credito: header.dias_credito ?? null,
        id_estado: String(header.id_estado),
        created_by: user.userId,
        updated_by: user.userId,
        created_at: now,
        updated_at: now,
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
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Error al crear cotizacion" }, { status: 500 });
  }
}
