import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Banknote,
  BarChart3,
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
}

const mainItems = [
  { title: "Dashboard", url: "/employer/dashboard", icon: LayoutDashboard },
];

const employeeItems = [
  { title: "My Employees", url: "/employer/employees", icon: Users },
];

const operationsItems = [
  { title: "Approvals", url: "/employer/approvals", icon: CheckSquare, hasBadge: true },
  { title: "Disbursements", url: "/employer/disbursements", icon: Banknote },
];

const reportItems = [
  { title: "Reports", url: "/employer/reports", icon: BarChart3 },
];

export function EmployerSidebar({ pendingApprovalsCount = 0, showApprovals = true }: EmployerSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

  const filteredOps = showApprovals
    ? operationsItems
    : operationsItems.filter((i) => i.title !== "Approvals");

  const renderGroup = (
    label: string,
    items: typeof mainItems,
    showBadge = false
  ) => (
    <SidebarGroup key={label}>
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title + item.url}>
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
              {showBadge &&
                "hasBadge" in item &&
                (item as any).hasBadge &&
                pendingApprovalsCount > 0 && (
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

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="p-4 border-b border-border">
        {!collapsed && (
          <img src={logoGreenDark} alt="Lamoola" className="h-8 w-auto object-contain" style={{ imageRendering: 'auto' }} />
        )}
      </SidebarHeader>
      <SidebarContent className="bg-card">
        {renderGroup("Main", mainItems)}
        {renderGroup("Employees", employeeItems)}
        {renderGroup("Operations", filteredOps, true)}
        {renderGroup("Reports", reportItems)}
      </SidebarContent>
    </Sidebar>
  );
}
