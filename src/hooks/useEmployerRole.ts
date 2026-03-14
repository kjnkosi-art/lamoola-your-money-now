import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getPermissionsForRole,
  type RolePermission,
  DEFAULT_EMPLOYER_PERMISSION,
} from "@/config/rolePermissions";

interface UseEmployerRoleResult {
  roleTitle: string | null;
  permissions: RolePermission;
  isLamoolaStaff: boolean;
  employerId: string | null;
  loading: boolean;
}

export function useEmployerRole(): UseEmployerRoleResult {
  const [roleTitle, setRoleTitle] = useState<string | null>(null);
  const [isLamoolaStaff, setIsLamoolaStaff] = useState(false);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      // Check if lamoola staff
      const { data: staff } = await supabase.rpc("is_lamoola_staff", {
        _user_id: user.id,
      });
      if (cancelled) return;

      if (staff) {
        setIsLamoolaStaff(true);
        // Staff bypasses — get employer_id if viewing as employer context
        const { data: eid } = await supabase.rpc("get_user_employer_id", {
          _user_id: user.id,
        });
        if (!cancelled) setEmployerId(eid || null);
        setLoading(false);
        return;
      }

      // Get employer_id
      const { data: eid } = await supabase.rpc("get_user_employer_id", {
        _user_id: user.id,
      });
      if (cancelled) return;
      setEmployerId(eid || null);

      if (!eid) {
        setLoading(false);
        return;
      }

      // Get profile email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();

      if (!profile?.email || cancelled) {
        setLoading(false);
        return;
      }

      // Match email against employer_contacts to find role_title
      const { data: contacts } = await supabase
        .from("employer_contacts")
        .select("role_title")
        .eq("employer_id", eid)
        .ilike("email", profile.email);

      if (cancelled) return;

      if (contacts && contacts.length > 0 && contacts[0].role_title) {
        setRoleTitle(contacts[0].role_title);
      } else {
        // Fallback: check if payroll contact
        const { data: employer } = await supabase
          .from("employers")
          .select("payroll_contact_email")
          .eq("employer_id", eid)
          .single();

        if (
          !cancelled &&
          employer?.payroll_contact_email?.toLowerCase() ===
            profile.email.toLowerCase()
        ) {
          setRoleTitle("Payroll Contact");
        }
      }

      if (!cancelled) setLoading(false);
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, []);

  const permissions = isLamoolaStaff
    ? {
        // Staff sees everything
        allowedRoutes: ["/employer"],
        sidebarItems: [
          "dashboard",
          "employees",
          "approvals",
          "disbursements",
          "invoices",
          "profile",
          "settings",
        ],
        defaultRoute: "/employer/dashboard",
        readOnlyRoutes: [] as string[],
      }
    : getPermissionsForRole(roleTitle);

  return { roleTitle, permissions, isLamoolaStaff, employerId, loading };
}
