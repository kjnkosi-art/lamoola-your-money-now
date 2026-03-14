import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Banknote,
  FileText,
  Building2,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import logoGreenDark from "@/assets/logo-green-dark.png";

interface EmployerSidebarProps {
  pendingApprovalsCount?: number;
  showApprovals?: boolean;
  visibleItems?: string[];
}

interface MenuItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  key: string;
  hasBadge?: boolean;
}

const ALL_ITEMS: MenuItem[] = [
  { title: "Dashboard", url: "/employer/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { title: "My Employees", url: "/employer/employees", icon: Users, key: "employees" },
  { title: "Approvals", url: "/employer/approvals", icon: CheckSquare, key: "approvals", hasBadge: true },
  { title: "Disbursements", url: "/employer/disbursements", icon: Banknote, key: "disbursements" },
  { title: "Invoices & Statements", url: "/employer/invoices", icon: FileText, key: "invoices" },
  { title: "Company Profile", url: "/employer/profile", icon: Building2, key: "profile" },
  { title: "Settings", url: "/employer/settings", icon: Settings, key: "settings" },
];

// Grouping config
const GROUPS: { label: string; keys: string[] }[] = [
  { label: "Main", keys: ["dashboard"] },
  { label: "Employees", keys: ["employees"] },
  { label: "Operations", keys: ["approvals", "disbursements", "invoices"] },
  { label: "Account", keys: ["profile", "settings"] },
];

export function EmployerSidebar({
  pendingApprovalsCount = 0,
  showApprovals = true,
  visibleItems,
}: EmployerSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

  const visibleSet = visibleItems ? new Set(visibleItems) : null;

  const filteredItems = ALL_ITEMS.filter((item) => {
    if (item.key === "approvals" && !showApprovals) return false;
    if (visibleSet && !visibleSet.has(item.key)) return false;
    return true;
  });

  const filteredItemsByKey = new Map(filteredItems.map((i) => [i.key, i]));

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="p-4 border-b border-border">
        {!collapsed && (
          <img src={logoGreenDark} alt="Lamoola" className="h-8 w-auto object-contain" style={{ imageRendering: "auto" }} />
        )}
      </SidebarHeader>
      <SidebarContent className="bg-card">
        {GROUPS.map((group) => {
          const groupItems = group.keys
            .map((k) => filteredItemsByKey.get(k))
            .filter(Boolean) as MenuItem[];
          if (groupItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupItems.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink
                          to={item.url}
                          end={item.url === "/employer/dashboard"}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                          activeClassName="bg-accent/10 text-accent font-bold border-l-[3px] border-accent"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                      {item.hasBadge && pendingApprovalsCount > 0 && (
                        <SidebarMenuBadge className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-5 h-5 flex items-center justify-center">
                          {pendingApprovalsCount}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
