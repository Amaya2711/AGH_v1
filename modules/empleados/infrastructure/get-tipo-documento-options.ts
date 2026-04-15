import { listTipoDocumento } from "@/modules/empleados/infrastructure/list-tipo-documento";

export async function getTipoDocumentoOptions() {
  const tipos = await listTipoDocumento();
  return tipos.map((t) => ({ value: t.id_tipodoc, label: t.nombre_documento }));
}
