"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Empleado } from "@/modules/empleados/domain/empleado";

interface EmpleadoFormProps {
  initialData?: Partial<Empleado>;
  onSubmit: (data: Partial<Empleado>) => Promise<void>;
  loading?: boolean;
}

export function EmpleadoForm({ initialData = {}, onSubmit, loading }: EmpleadoFormProps) {
  const [form, setForm] = useState<Partial<Empleado>>(initialData);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    router.push("/empleados");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block mb-1 font-medium">Nombre</label>
        <input name="nombre_empleado" value={form.nombre_empleado || ""} onChange={handleChange} required className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block mb-1 font-medium">ID Tipo Doc</label>
        <input name="id_tipodoc" value={form.id_tipodoc || ""} onChange={handleChange} required className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block mb-1 font-medium">Nro Documento</label>
        <input name="nro_documento" value={form.nro_documento || ""} onChange={handleChange} required className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block mb-1 font-medium">Teléfono</label>
        <input name="telefono" value={form.telefono || ""} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
    </form>
  );
}
