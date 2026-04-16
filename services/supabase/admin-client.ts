import { createClient } from "@supabase/supabase-js";
import { getPrivateEnv, getPublicEnv } from "@/lib/env";
import type { Database } from "@/types/database.generated";

export function createAdminSupabaseClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getPrivateEnv();

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no esta configurada");
  }

  return createClient<Database>(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
