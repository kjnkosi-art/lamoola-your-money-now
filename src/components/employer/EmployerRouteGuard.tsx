import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEmployerRole } from "@/hooks/useEmployerRole";

interface EmployerRouteGuardProps {
  children: React.ReactNode;
}

export function EmployerRouteGuard({ children }: EmployerRouteGuardProps) {
  const { permissions, isLamoolaStaff, loading } = useEmployerRole();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Staff bypasses all checks
    if (isLamoolaStaff) return;

    const allowed = permissions.allowedRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(route + "/")
    );

    if (!allowed) {
      navigate(permissions.defaultRoute, { replace: true });
    }
  }, [loading, isLamoolaStaff, permissions, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
