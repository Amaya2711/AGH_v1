"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cotizacionSchema,
  type CotizacionFormValues,
} from "@/modules/cotizaciones/domain/schemas/cotizacion.schema";
import type {
  CotizacionConDetalle,
  DetraccionOption,
  EstadoRow,
  MonedaRow,
  TipoPagoRow,
} from "@/modules/cotizaciones/domain/types";

interface ClienteOption {
  id_cliente: string;
  nombre: string;
  ruc: string;
}

interface CotizacionFormProps {
  mode: "create" | "update";
  initialData?: CotizacionConDetalle;
  clientes: Pick<ClienteOption, "id_cliente" | "nombre" | "ruc">[];
  monedas: Pick<MonedaRow, "id_moneda" | "nombre_moneda">[];
  tiposPago: Pick<TipoPagoRow, "id_tipo" | "forma_pago">[];
  estados: Pick<EstadoRow, "id_estado" | "nombre_estado">[];
  detracciones: DetraccionOption[];
}

const IGV_RATE = 0.18;

function toNumber(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function currencySymbol(nombreMoneda: string | null | undefined) {
  if (!nombreMoneda) return "";

  const normalized = nombreMoneda.toLowerCase();
  if (normalized.includes("sol")) return "S/";
  if (normalized.includes("dolar") || normalized.includes("usd")) return "$";
  if (normalized.includes("euro")) return "EUR";

  return "";
}

function formatAmount(value: number, symbol: string) {
  const amount = value.toFixed(2);
  return symbol ? `${symbol} ${amount}` : amount;
}

function currentLocalDate() {
  const peruNow = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(peruNow);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function CotizacionForm({
  mode,
  initialData,
  clientes,
  monedas,
  tiposPago,
  estados,
  detracciones,
}: CotizacionFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [clienteQuery, setClienteQuery] = useState(() => {
    const selectedCliente = clientes.find(
      (cliente) => cliente.id_cliente === initialData?.id_cliente
    );
    return selectedCliente ? `${selectedCliente.nombre} (${selectedCliente.ruc})` : "";
  });
  const [showClienteOptions, setShowClienteOptions] = useState(false);
  const defaultTipoPagoId =
    tiposPago.find((item) => item.forma_pago.trim().toUpperCase() === "EFECTIVO")?.id_tipo ??
    "";
  const defaultMonedaId =
    monedas.find((item) => item.nombre_moneda.trim().toUpperCase() === "SOLES")?.id_moneda ??
    "";

  const defaultDetalles =
    initialData?.detalles?.map((d) => ({
      id_cotizacion: d.id_cotizacion,
      correlativo: d.correlativo,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      total: d.total,
      estado: d.estado,
    })) ?? [
      {
        correlativo: 1,
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0,
        total: 0,
        estado: true,
      },
    ];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CotizacionFormValues>({
    resolver: zodResolver(cotizacionSchema),
    defaultValues: {
      anio: initialData?.anio ?? new Date().getFullYear(),
      id_cliente: initialData?.id_cliente ?? "",
      fecha: initialData?.fecha ?? currentLocalDate(),
      id_pago: initialData?.id_pago ?? defaultTipoPagoId,
      id_moneda: initialData?.id_moneda ?? defaultMonedaId,
      valido_dias: initialData?.valido_dias ?? 15,
      entrega_horas: initialData?.entrega_horas ?? 24,
      id_detraccion:
        detracciones.find((item) => Math.abs(item.porcentaje * (initialData?.total_previo ?? 0) - (initialData?.detraccion ?? 0)) < 0.01)?.id ?? null,
      subtotal: initialData?.subtotal ?? 0,
      igv: initialData?.igv ?? 0,
      total_previo: initialData?.total_previo ?? 0,
      detraccion: initialData?.detraccion ?? 0,
      total: initialData?.total ?? 0,
      dias_credito: initialData?.dias_credito ?? null,
      id_estado: initialData?.id_estado ?? (estados[0]?.id_estado ?? 1),
      estado: initialData?.estado ?? true,
      detalles: defaultDetalles,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  const detalles = useWatch({ control, name: "detalles" });
  const idMoneda = useWatch({ control, name: "id_moneda" });
  const idDetraccion = useWatch({ control, name: "id_detraccion" });
  const subtotal = useWatch({ control, name: "subtotal" });
  const igv = useWatch({ control, name: "igv" });
  const totalPrevio = useWatch({ control, name: "total_previo" });
  const detraccion = useWatch({ control, name: "detraccion" });
  const total = useWatch({ control, name: "total" });
  const selectedCurrencySymbol = currencySymbol(
    monedas.find((item) => item.id_moneda === idMoneda)?.nombre_moneda
  );
  const selectedDetraccionRate =
    detracciones.find((item) => item.id === idDetraccion)?.porcentaje ??
    (totalPrevio > 0 ? detraccion / totalPrevio : 0);
  const detraccionLabel = `Detraccion (${(selectedDetraccionRate * 100).toFixed(2)}%)`;
  const filteredClientes = useMemo(() => {
    const query = clienteQuery.trim().toLowerCase();
    if (!query) {
      return clientes.slice(0, 8);
    }

    return clientes
      .filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(query) ||
          cliente.ruc.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [clienteQuery, clientes]);

  // Recalculate totals whenever detalles change
  useEffect(() => {
    const subtotal = detalles.reduce((sum, d) => sum + toNumber(d.total), 0);
    const igv = subtotal * IGV_RATE;
    const total_previo = subtotal + igv;
    const detraccionRate = detracciones.find((item) => item.id === idDetraccion)?.porcentaje ?? 0;
    const detraccion = total_previo * detraccionRate;
    const total = total_previo - detraccion;

    setValue("subtotal", parseFloat(subtotal.toFixed(2)));
    setValue("igv", parseFloat(igv.toFixed(2)));
    setValue("total_previo", parseFloat(total_previo.toFixed(2)));
    setValue("detraccion", parseFloat(detraccion.toFixed(2)));
    setValue("total", parseFloat(total.toFixed(2)));
  }, [detalles, detracciones, idDetraccion, setValue]);

  // Auto-calc line total — read current form values via getValues to avoid watch() warning
  function handleLineChange(index: number) {
    const cantidad = toNumber(getValues(`detalles.${index}.cantidad`));
    const precio = toNumber(getValues(`detalles.${index}.precio_unitario`));
    setValue(`detalles.${index}.total`, parseFloat((cantidad * precio).toFixed(2)));
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const endpoint =
      mode === "create"
        ? "/api/cotizaciones"
        : `/api/cotizaciones/${initialData?.id_cotizacion}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setServerError("No se pudo guardar la cotizacion.");
      return;
    }

    const result = (await response.json()) as {
      id_cotizacion: string;
      pdfUrl: string;
      emailSent: boolean;
      recipient: string | null;
    };

    const params = new URLSearchParams({
      email: result.emailSent ? "ok" : "error",
    });

    if (result.recipient) {
      params.set("recipient", result.recipient);
    }

    router.replace(`${result.pdfUrl}?${params.toString()}`);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4 card-enter">
        {/* <h2 className="text-base font-semibold text-foreground">Datos de la cotizacion</h2> */}

        <div className="grid gap-4 lg:grid-cols-4 sm:grid-cols-2">
          {/* Campo Año oculto, siempre año vigente */}
          <input type="hidden" {...register("anio", { valueAsNumber: true })} value={new Date().getFullYear()} />
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">Fecha</label>
            <Input type="date" {...register("fecha")} />
            {errors.fecha && (
              <p className="mt-1 text-xs text-danger">{errors.fecha.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">Cliente</label>
            <div className="relative">
              <input type="hidden" {...register("id_cliente")} />
              <Input
                value={clienteQuery}
                placeholder="Buscar cliente por nombre o RUC"
                onChange={(event) => {
                  setClienteQuery(event.target.value);
                  setShowClienteOptions(true);
                  setValue("id_cliente", "", { shouldDirty: true, shouldValidate: true });
                }}
                onFocus={() => setShowClienteOptions(true)}
                onBlur={() => {
                  setTimeout(() => {
                    setShowClienteOptions(false);
                  }, 120);
                }}
              />

              {showClienteOptions ? (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-white shadow-md">
                  {filteredClientes.length > 0 ? (
                    filteredClientes.map((cliente) => (
                      <button
                        key={cliente.id_cliente}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-surface-strong"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          setValue("id_cliente", cliente.id_cliente, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          setClienteQuery(`${cliente.nombre} (${cliente.ruc})`);
                          setShowClienteOptions(false);
                        }}
                      >
                        {cliente.nombre} ({cliente.ruc})
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      Sin coincidencias
                    </p>
                  )}
                </div>
              ) : null}
            </div>
            {errors.id_cliente && (
              <p className="mt-1 text-xs text-danger">{errors.id_cliente.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">Tipo de pago</label>
            <select
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("id_pago")}
            >
              <option value="">Seleccionar tipo</option>
              {tiposPago.map((t) => (
                <option key={t.id_tipo} value={t.id_tipo}>
                  {t.forma_pago}
                </option>
              ))}
            </select>
            {errors.id_pago && (
              <p className="mt-1 text-xs text-danger">{errors.id_pago.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">Moneda</label>
            <select
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("id_moneda")}
            >
              <option value="">Seleccionar moneda</option>
              {monedas.map((m) => (
                <option key={m.id_moneda} value={m.id_moneda}>
                  {m.nombre_moneda}
                </option>
              ))}
            </select>
            {errors.id_moneda && (
              <p className="mt-1 text-xs text-danger">{errors.id_moneda.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">Valido (dias)</label>
            <Input
              type="number"
              {...register("valido_dias", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">Entrega (horas)</label>
            <Input
              type="number"
              {...register("entrega_horas", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">Dias credito</label>
            <Input
              type="number"
              placeholder="0"
              {...register("dias_credito", {
                setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
              })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">Detraccion</label>
            <select
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("id_detraccion", {
                setValueAs: (value) => (value ? value : null),
              })}
            >
              {detracciones.length > 0 && (
                <option key={detracciones[0].id} value={detracciones[0].id}>
                  {detracciones[0].nombre} ({(detracciones[0].porcentaje * 100).toFixed(2)}%)
                </option>
              )}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(300px,1fr)_220px]">
          {/* Campo Cotizacion activa oculto, siempre true */}
          <input type="hidden" {...register("estado")} value={true} />
        </div>
      </section>

      {/* ── Detalle ───────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Detalle de items</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              append({
                correlativo: fields.length + 1,
                descripcion: "",
                cantidad: 1,
                precio_unitario: 0,
                total: 0,
                estado: true,
              })
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Agregar item
          </Button>
        </div>

        {errors.detalles?.root && (
          <p className="text-xs text-danger">{errors.detalles.root.message}</p>
        )}
        {typeof errors.detalles?.message === "string" && (
          <p className="text-xs text-danger">{errors.detalles.message}</p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-strong text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2 min-w-[260px]">Descripcion</th>
                <th className="px-3 py-2 w-24">Cantidad</th>
                <th className="px-3 py-2 w-32">Precio unit.</th>
                <th className="px-3 py-2 w-32 text-right">Total</th>
                <th className="px-3 py-2 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-t border-border">
                  <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                  <td className="px-3 py-2">
                    <Input
                      placeholder="Descripcion del bien o servicio"
                      {...register(`detalles.${index}.descripcion`)}
                    />
                    {errors.detalles?.[index]?.descripcion && (
                      <p className="mt-0.5 text-xs text-danger">
                        {errors.detalles[index]?.descripcion?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`detalles.${index}.cantidad`, {
                        valueAsNumber: true,
                        onChange: () => handleLineChange(index),
                      })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`detalles.${index}.precio_unitario`, {
                        valueAsNumber: true,
                        onChange: () => handleLineChange(index),
                      })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      readOnly
                      className="bg-surface-strong text-right font-mono"
                      {...register(`detalles.${index}.total`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-muted-foreground hover:text-danger transition-colors"
                        title="Eliminar fila"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Totales ───────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono">{formatAmount(subtotal, selectedCurrencySymbol)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>IGV (18%)</span>
            <span className="font-mono">{formatAmount(igv, selectedCurrencySymbol)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total previo</span>
            <span className="font-mono">{formatAmount(totalPrevio, selectedCurrencySymbol)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>{detraccionLabel}</span>
            <span className="font-mono">{formatAmount(detraccion, selectedCurrencySymbol)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground text-base">
            <span>Total</span>
            <span className="font-mono">{formatAmount(total, selectedCurrencySymbol)}</span>
          </div>
        </div>
      </section>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{serverError}</p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : mode === "create"
            ? "Crear cotizacion"
            : "Actualizar cotizacion"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/cotizaciones")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
