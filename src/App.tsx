import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmployers from "./pages/AdminEmployers";
import AddEmployer from "./pages/AddEmployer";
import AdminEmployees from "./pages/AdminEmployees";
import AddEmployee from "./pages/AddEmployee";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import RequestSalaryAccess from "./pages/RequestSalaryAccess";
import ApprovalQueue from "./pages/ApprovalQueue";
import AdminDisbursements from "./pages/AdminDisbursements";
import NotFound from "./pages/NotFound";

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
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/employees/new" element={<AddEmployee />} />
          <Route path="/admin/employees/:id" element={<EmployeeProfile />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/request" element={<RequestSalaryAccess />} />
          <Route path="/admin/approvals" element={<ApprovalQueue />} />
          <Route path="/employer/approvals" element={<ApprovalQueue />} />
          <Route path="/admin/disbursements" element={<AdminDisbursements />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

