import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmployers from "./pages/AdminEmployers";
import AddEmployer from "./pages/AddEmployer";
import AdminEmployees from "./pages/AdminEmployees";
import AddEmployee from "./pages/AddEmployee";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerProfilePage from "./pages/EmployerProfile";
import RequestSalaryAccess from "./pages/RequestSalaryAccess";
import ApprovalQueue from "./pages/ApprovalQueue";
import AdminDisbursements from "./pages/AdminDisbursements";
import NotFound from "./pages/NotFound";

// Employer role-based pages
import { EmployerRouteGuard } from "./components/employer/EmployerRouteGuard";
import EmployerEmployees from "./pages/employer/EmployerEmployees";
import EmployerDisbursements from "./pages/employer/EmployerDisbursements";
import EmployerInvoices from "./pages/employer/EmployerInvoices";
import EmployerSettings from "./pages/employer/EmployerSettings";
import EmployerProfileView from "./pages/employer/EmployerProfileView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employers" element={<AdminEmployers />} />
          <Route path="/admin/employers/new" element={<AddEmployer />} />
          <Route path="/admin/employers/:id" element={<EmployerProfilePage />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/employees/new" element={<AddEmployee />} />
          <Route path="/admin/employees/:id" element={<EmployeeProfile />} />
          <Route path="/admin/approvals" element={<ApprovalQueue />} />
          <Route path="/admin/disbursements" element={<AdminDisbursements />} />

          {/* Employer routes — protected by role */}
          <Route path="/employer/dashboard" element={<EmployerRouteGuard><EmployerDashboard /></EmployerRouteGuard>} />
          <Route path="/employer/employees" element={<EmployerRouteGuard><EmployerEmployees /></EmployerRouteGuard>} />
          <Route path="/employer/approvals" element={<EmployerRouteGuard><ApprovalQueue /></EmployerRouteGuard>} />
          <Route path="/employer/disbursements" element={<EmployerRouteGuard><EmployerDisbursements /></EmployerRouteGuard>} />
          <Route path="/employer/invoices" element={<EmployerRouteGuard><EmployerInvoices /></EmployerRouteGuard>} />
          <Route path="/employer/profile" element={<EmployerRouteGuard><EmployerProfileView /></EmployerRouteGuard>} />
          <Route path="/employer/settings" element={<EmployerRouteGuard><EmployerSettings /></EmployerRouteGuard>} />

          {/* Employee routes */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/request" element={<RequestSalaryAccess />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
