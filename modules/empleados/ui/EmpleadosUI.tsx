"use client";
import { useState, useEffect } from "react";
import { Empleado } from "../domain/empleado";
import { getEmpleados, addEmpleado, updateEmpleado, inactivateEmpleado } from "../infrastructure/empleado-api";

export function EmpleadosUI() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [form, setForm] = useState<Partial<Empleado>>({ estado: true });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    getEmpleados().then(setEmpleados);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateEmpleado(editId, form);
      setEditId(null);
    } else {
      await addEmpleado({
        ...form,
        id_empleado: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        estado: true,
      } as Empleado);
    }
    setForm({ estado: true });
    setEmpleados(await getEmpleados());
  };

  const handleEdit = (empleado: Empleado) => {
    setEditId(empleado.id_empleado);
    setForm(empleado);
  };

  const handleInactivate = async (id: string) => {
    await inactivateEmpleado(id);
    setEmpleados(await getEmpleados());
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 flex flex-col gap-2 max-w-xl">
        <input name="nombre_empleado" value={form.nombre_empleado || ""} onChange={handleChange} placeholder="Nombre" required className="input input-bordered" />
        <input name="id_tipodoc" value={form.id_tipodoc || ""} onChange={handleChange} placeholder="ID Tipo Doc" required className="input input-bordered" />
        <input name="nro_documento" value={form.nro_documento || ""} onChange={handleChange} placeholder="Nro Documento" required className="input input-bordered" />
        <input name="telefono" value={form.telefono || ""} onChange={handleChange} placeholder="Teléfono" className="input input-bordered" />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">{editId ? "Actualizar" : "Crear"}</button>
          {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm({ estado: true }); }}>Cancelar</button>}
        </div>
      </form>
      <table className="table-auto w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>ID Tipo Doc</th>
            <th>Nro Documento</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((e) => (
            <tr key={e.id_empleado}>
              <td>{e.nombre_empleado}</td>
              <td>{e.id_tipodoc}</td>
              <td>{e.nro_documento}</td>
              <td>{e.telefono}</td>
              <td>{e.estado ? "Activo" : "Inactivo"}</td>
              <td>
                <button className="btn btn-xs btn-info mr-2" onClick={() => handleEdit(e)}>Editar</button>
                {e.estado && <button className="btn btn-xs btn-warning" onClick={() => handleInactivate(e.id_empleado)}>Inactivar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
