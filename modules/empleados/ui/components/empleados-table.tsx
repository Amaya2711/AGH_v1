import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
// TODO: Reemplazar con fetch real de empleados
import { Empleado } from "@/modules/empleados/domain/empleado";

interface EmpleadosTableProps {
  empleados: Empleado[];
}

export function EmpleadosTable({ empleados }: EmpleadosTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-strong text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">ID Tipo Doc</th>
              <th className="px-4 py-3">Nro Documento</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado) => (
              <tr key={empleado.id_empleado} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">{empleado.nombre_empleado}</td>
                <td className="px-4 py-3 text-muted-foreground">{empleado.id_tipodoc}</td>
                <td className="px-4 py-3 text-muted-foreground">{empleado.nro_documento}</td>
                <td className="px-4 py-3 text-muted-foreground">{empleado.telefono ?? "-"}</td>
                <td className="px-4 py-3"><StatusBadge active={empleado.estado} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/empleados/${empleado.id_empleado}`}><Button variant="secondary">Editar</Button></Link>
                    <Button variant="ghost">{empleado.estado ? "Desactivar" : "Activar"}</Button>
                    <Button variant="danger">Eliminar</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
