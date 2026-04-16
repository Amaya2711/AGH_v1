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

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser({
        id: data.user.id,
        email: data.user.email ?? null,
      });

      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser({
        id: session.user.id,
        email: session.user.email ?? null,
      });
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}