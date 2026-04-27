import Link from "next/link";

import { Button } from "@/components/ui/button";

interface CotizacionPdfPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    email?: string;
    recipient?: string;
    emailError?: string;
  }>;
}

export default async function CotizacionPdfPage({ params, searchParams }: CotizacionPdfPageProps) {
  const { id } = await params;
  const { email, recipient, emailError } = await searchParams;
  const emailSent = email === "ok";
  const emailFailed = email === "error";

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Cotizaciones
          </p>
          <h2 className="text-3xl font-bold text-foreground">Documento PDF</h2>
        </div>
        <div className="flex gap-2">
          <Link href={`/api/cotizaciones/${id}/pdf`} target="_blank">
            <Button variant="ghost">Abrir en nueva pestaña</Button>
          </Link>
          <Link href="/cotizaciones">
            <Button variant="secondary">Volver al listado</Button>
          </Link>
        </div>
      </div>

      {emailSent ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-success">
          El PDF fue enviado automaticamente a {recipient ?? "la direccion configurada"}.
        </p>
      ) : null}

      {emailFailed ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          La cotizacion se guardo y el PDF se genero, pero el envio automatico no pudo completarse.<br />
          <b>Error:</b> {emailError || "Revise la configuracion SMTP."}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <iframe
          src={`/api/cotizaciones/${id}/pdf`}
          title="Vista previa PDF de cotizacion"
          className="h-[78vh] w-full"
        />
      </div>
    </section>
  );
}
