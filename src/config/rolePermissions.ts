export interface RolePermission {
  allowedRoutes: string[];
  sidebarItems: string[];
  defaultRoute: string;
  readOnlyRoutes: string[];
}

export const EMPLOYER_ROLE_PERMISSIONS: Record<string, RolePermission> = {
  "Employer System Admin": {
    allowedRoutes: [
      "/employer/dashboard",
      "/employer/employees",
      "/employer/approvals",
      "/employer/disbursements",
      "/employer/invoices",
      "/employer/profile",
      "/employer/settings",
    ],
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
    readOnlyRoutes: [],
  },
  "HR Manager": {
    allowedRoutes: [
      "/employer/approvals",
      "/employer/employees",
      "/employer/disbursements",
      "/employer/invoices",
    ],
    sidebarItems: ["approvals", "employees", "disbursements", "invoices"],
    defaultRoute: "/employer/approvals",
    readOnlyRoutes: ["/employer/employees"],
  },
  Supervisor: {
    allowedRoutes: ["/employer/approvals"],
    sidebarItems: ["approvals"],
    defaultRoute: "/employer/approvals",
    readOnlyRoutes: [],
  },
  "Payroll Contact": {
    allowedRoutes: [
      "/employer/dashboard",
      "/employer/employees",
      "/employer/disbursements",
      "/employer/invoices",
    ],
    sidebarItems: ["dashboard", "employees", "disbursements", "invoices"],
    defaultRoute: "/employer/dashboard",
    readOnlyRoutes: ["/employer/employees"],
  },
  "Finance Manager": {
    allowedRoutes: [
      "/employer/dashboard",
      "/employer/disbursements",
      "/employer/invoices",
    ],
    sidebarItems: ["dashboard", "disbursements", "invoices"],
    defaultRoute: "/employer/dashboard",
    readOnlyRoutes: ["/employer/disbursements"],
  },
};

// Default for unknown roles — minimal access
export const DEFAULT_EMPLOYER_PERMISSION: RolePermission = {
  allowedRoutes: ["/employer/dashboard"],
  sidebarItems: ["dashboard"],
  defaultRoute: "/employer/dashboard",
  readOnlyRoutes: [],
};

export function getPermissionsForRole(roleTitle: string | null): RolePermission {
  if (!roleTitle) return DEFAULT_EMPLOYER_PERMISSION;
  return EMPLOYER_ROLE_PERMISSIONS[roleTitle] || DEFAULT_EMPLOYER_PERMISSION;
}

export function isRouteAllowed(roleTitle: string | null, path: string): boolean {
  const perms = getPermissionsForRole(roleTitle);
  return perms.allowedRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );
}

export function isReadOnly(roleTitle: string | null, path: string): boolean {
  const perms = getPermissionsForRole(roleTitle);
  return perms.readOnlyRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );
}
