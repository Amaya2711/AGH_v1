import type { DatabaseType } from "@/types/database.supabase";

export type ClienteRow = DatabaseType["public"]["Tables"]["cliente"]["Row"];
export type ClienteInsert = DatabaseType["public"]["Tables"]["cliente"]["Insert"];
export type ClienteUpdate = DatabaseType["public"]["Tables"]["cliente"]["Update"];
