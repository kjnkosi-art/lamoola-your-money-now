import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AdminTopBarProps {
  firstName?: string;
  lastName?: string;
}

export function AdminTopBar({ firstName, lastName }: AdminTopBarProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const initials = `${(firstName || "L")[0]}${(lastName || "A")[0]}`.toUpperCase();

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b-2 border-accent bg-secondary">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-white hover:bg-white/10" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-white/80 hidden sm:inline">
          {firstName} {lastName}
        </span>
        <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-white/70 hover:text-white hover:bg-white/10 text-xs gap-1.5"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
