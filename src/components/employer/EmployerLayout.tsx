import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EmployerSidebar } from "./EmployerSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { useEmployerRole } from "@/hooks/useEmployerRole";

interface EmployerLayoutProps {
  children: React.ReactNode;
}

export function EmployerLayout({ children }: EmployerLayoutProps) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { permissions, loading: roleLoading } = useEmployerRole();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name);
        setLastName(profile.last_name);
      }

      const { data: employerId } = await supabase.rpc("get_user_employer_id", { _user_id: user.id });

      if (employerId) {
        const { count } = await supabase
          .from("requests")
          .select("*", { count: "exact", head: true })
          .eq("employer_id", employerId)
          .eq("request_status", "Pending");
        setPendingCount(count || 0);
      }

      setLoading(false);
    };

    init();
  }, [navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <EmployerSidebar
          pendingApprovalsCount={pendingCount}
          showApprovals={permissions.sidebarItems.includes("approvals")}
          visibleItems={permissions.sidebarItems}
        />
        <div className="flex-1 flex flex-col">
          <AdminTopBar firstName={firstName} lastName={lastName} />
          <main className="flex-1 p-6 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
