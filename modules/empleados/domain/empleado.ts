export interface Empleado {
  id_empleado: string;
  nombre_empleado: string;
  id_tipodoc: string;
  nro_documento: string;
  telefono?: string;
  estado: boolean;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}
