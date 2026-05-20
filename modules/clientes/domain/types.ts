import type { Database } from "@/types/database.supabase";

export type ClienteRow = Database["_public"]["Tables"]["cliente"]["Row"];
export type ClienteInsert = Database["_public"]["Tables"]["cliente"]["Insert"];
export type ClienteUpdate = Database["_public"]["Tables"]["cliente"]["Update"];
