import { Empleado } from "../domain/empleado";

// Simulación de API temporal
let empleados: Empleado[] = [];

export async function getEmpleados(): Promise<Empleado[]> {
  return empleados;
}

export async function addEmpleado(empleado: Empleado): Promise<void> {
  empleados.push(empleado);
}

export async function updateEmpleado(id: string, data: Partial<Empleado>): Promise<void> {
  empleados = empleados.map((e) => (e.id_empleado === id ? { ...e, ...data } : e));
}

export async function inactivateEmpleado(id: string): Promise<void> {
  empleados = empleados.map((e) => (e.id_empleado === id ? { ...e, estado: false } : e));
}
