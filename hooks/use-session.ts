"use client";

import { useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/services/supabase/browser-client";

interface SessionUser {
  id: string;
  email: string | null;
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getUser().then(({ data }: { data: { user: { id: string; email: string | null } } }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? null });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      if (!session?.user) {
        setUser(null);
        return;
      }

      setUser({ id: session.user.id, email: session.user.email ?? null });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
