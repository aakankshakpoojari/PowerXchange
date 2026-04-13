import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

/**
 * useAdminGuard
 *
 * Drop this into any admin page to protect it.
 * It checks BOTH profiles.role AND the admin_roles table (fallback),
 * so it works regardless of which method was used to grant admin access.
 *
 * Usage:
 *   useAdminGuard(onVerified);
 *   // onVerified() is called once the user is confirmed as admin — use it to fetch data.
 *
 * deps (optional): pass extra values (like a filter state) that should
 *   re-trigger the guard+fetch when they change.
 */
export function useAdminGuard(onVerified, deps = []) {
  const navigate = useNavigate();

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const uid = session.user.id;

      // Check profiles.role first
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      if (profile?.role === "admin") {
        onVerified();
        return;
      }

      // Fallback: check admin_roles table
      const { data: adminRole } = await supabase
        .from("admin_roles")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();

      if (adminRole) {
        onVerified();
      } else {
        navigate("/home");
      }
    }

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}