import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function getNomeFromUser(u: User | null): string {
  if (!u) return "";
  const meta = (u.user_metadata ?? {}) as { nome_completo?: string };
  return meta.nome_completo ?? u.email ?? "";
}

export function useClienteAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, nome: getNomeFromUser(user) };
}
