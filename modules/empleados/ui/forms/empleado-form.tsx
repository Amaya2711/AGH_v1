"use client";
import { useState, useEffect } from "react";
// Cargar tipos de documento desde API REST
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Empleado } from "@/modules/empleados/domain/empleado";

interface EmpleadoFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Empleado>;
  onSubmit?: (data: Partial<Empleado>) => Promise<void>;
  loading?: boolean;
}


export function EmpleadoForm({ mode, initialData, onSubmit, loading }: EmpleadoFormProps) {
  const [tipoDocOptions, setTipoDocOptions] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState<Partial<Empleado>>({ estado: true, ...initialData });
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tipo-documento")
      .then((res) => res.json())
      .then((opts) => setTipoDocOptions(opts));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, estado: e.target.checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(form).then(() => {
        router.push("/empleados");
      });
    } else {
      router.push("/empleados");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 font-medium">Nombre</label>
          <input name="nombre_empleado" value={form.nombre_empleado || ""} onChange={handleChange} required className="input input-bordered w-full" placeholder="Nombre completo" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Tipo de Documento</label>
          <select
            name="id_tipodoc"
            value={form.id_tipodoc || ""}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
          >
            <option value="" disabled>
              Selecciona tipo de documento
            </option>
            {tipoDocOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Nro Documento</label>
          <input name="nro_documento" value={form.nro_documento || ""} onChange={handleChange} required className="input input-bordered w-full" placeholder="Número de documento" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Teléfono</label>
          <input name="telefono" value={form.telefono || ""} onChange={handleChange} className="input input-bordered w-full" placeholder="Teléfono de contacto" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="estado" name="estado" checked={!!form.estado} onChange={handleCheckbox} />
        <label htmlFor="estado">Empleado activo</label>
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="submit" disabled={loading}>{mode === "create" ? "Crear empleado" : "Guardar cambios"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/empleados")}>Cancelar</Button>
      </div>
    </form>
  );
}
