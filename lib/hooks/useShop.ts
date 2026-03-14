"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TShop } from "@/types";

export function useShop() {
  const [shop, setShop] = useState<TShop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      setShop(data as TShop | null);
      setLoading(false);
    };

    fetchShop();
  }, []);

  return { shop, loading };
}
