import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Save, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import TempPasswordModal from "@/components/TempPasswordModal";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Tables, Database } from "@/integrations/supabase/types";

type Employer = Tables<"employers">;
type EmployerContact = Tables<"employer_contacts">;
type EmploymentType = Database["public"]["Enums"]["employment_type"];
type AccountType = Database["public"]["Enums"]["account_type"];

const EMPLOYMENT_TYPES: EmploymentType[] = ["Permanent", "Contract", "Part-time", "Seasonal"];
const ACCOUNT_TYPES: AccountType[] = ["Cheque", "Savings", "Transmission"];

// Helper to extract DOB from SA ID (YYMMDD format in first 6 digits)
function extractDobFromSaId(saId: string): Date | null {
  if (saId.length !== 13 || !/^\d{13}$/.test(saId)) return null;
  
  const yy = parseInt(saId.substring(0, 2), 10);
  const mm = parseInt(saId.substring(2, 4), 10);
  const dd = parseInt(saId.substring(4, 6), 10);
  
  // Determine century: if yy > current year's last 2 digits, assume 1900s
  const currentYear = new Date().getFullYear();
  const currentYY = currentYear % 100;
  const century = yy > currentYY ? 1900 : 2000;
  const year = century + yy;
  
  // Validate date
  const date = new Date(year, mm - 1, dd);
  if (date.getMonth() !== mm - 1 || date.getDate() !== dd) return null;
  
  return date;
}

// Luhn algorithm for SA ID validation
function isValidLuhn(num: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

const formSchema = z.object({
  employer_id: z.string().uuid({ message: "Please select an employer" }),
  employee_number: z.string().min(1, "Employee number is required"),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  sa_id_or_passport: z.string().min(1, "SA ID or Passport is required"),
  date_of_birth: z.date().optional(),
  mobile_number: z.string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^0[6-8]\d{8}$/, "Invalid SA mobile number format"),
  email_address: z.string().email().optional().or(z.literal("")),
  employment_status: z.enum(["Permanent", "Contract", "Part-time", "Seasonal"]).optional(),
  employment_start_date: z.date().optional(),
  gross_salary: z.string().min(1, "Gross salary is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  bank_account_number: z.string().min(1, "Bank account number is required"),
  account_type: z.enum(["Cheque", "Savings", "Transmission"]).optional(),
  department: z.string().optional(),
  supervisor_contact_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let pw = "";
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export default function AddEmployee() {
  const navigate = useNavigate();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [supervisors, setSupervisors] = useState<EmployerContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [idDocType, setIdDocType] = useState<"sa_id" | "passport" | null>(null);
  const [tempPasswordModal, setTempPasswordModal] = useState<{ open: boolean; credentials: import("@/components/TempPasswordModal").CredentialEntry[] }>({ open: false, credentials: [] });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employer_id: "",
      employee_number: "",
      first_name: "",
      last_name: "",
      sa_id_or_passport: "",
      mobile_number: "",
      email_address: "",
      gross_salary: "",
      bank_name: "",
      bank_account_number: "",
      department: "",
      supervisor_contact_id: "",
    },
  });

  const selectedEmployerId = form.watch("employer_id");

  useEffect(() => {
    if (!selectedEmployerId) {
      setSupervisors([]);
      return;
    }
    const fetchSupervisors = async () => {
      const { data } = await supabase
        .from("employer_contacts")
        .select("*")
        .eq("employer_id", selectedEmployerId)
        .eq("role_title", "Supervisor");
      setSupervisors(data || []);
    };
    fetchSupervisors();
  }, [selectedEmployerId]);

  useEffect(() => {
    const fetchEmployers = async () => {
      const { data } = await supabase
        .from("employers")
        .select("*")
        .eq("status", "Active")
        .order("company_legal_name");
      setEmployers(data || []);
    };
    fetchEmployers();
  }, []);

  // Watch SA ID field for auto-detection
  const saIdValue = form.watch("sa_id_or_passport");

  useEffect(() => {
    if (!saIdValue) {
      setIdDocType(null);
      return;
    }

    // Auto-detect: 13 digits = SA ID, otherwise passport
    if (/^\d{13}$/.test(saIdValue)) {
      setIdDocType("sa_id");
      // Auto-fill DOB from SA ID
      const dob = extractDobFromSaId(saIdValue);
      if (dob) {
        form.setValue("date_of_birth", dob);
      }
    } else {
      setIdDocType("passport");
    }
  }, [saIdValue, form]);

  const handleSave = async (status: "Pending Invite" | "Draft") => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    setLoading(true);

    try {
      const { data: empData, error } = await supabase.from("employees").insert({
        employer_id: values.employer_id,
        employee_number: values.employee_number,
        first_name: values.first_name,
        last_name: values.last_name,
        sa_id_or_passport: values.sa_id_or_passport,
        id_document_type: idDocType,
        date_of_birth: values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null,
        mobile_number: values.mobile_number,
        email_address: values.email_address || null,
        employment_status: values.employment_status || null,
        employment_start_date: values.employment_start_date 
          ? format(values.employment_start_date, "yyyy-MM-dd") 
          : null,
        gross_salary: parseFloat(values.gross_salary),
        bank_name: values.bank_name,
        bank_account_number: values.bank_account_number,
        account_type: values.account_type || null,
        department: values.department || null,
        supervisor_name: values.supervisor_contact_id
          ? supervisors.find((s) => s.contact_id === values.supervisor_contact_id)
            ? `${supervisors.find((s) => s.contact_id === values.supervisor_contact_id)!.first_name} ${supervisors.find((s) => s.contact_id === values.supervisor_contact_id)!.last_name}`
            : null
          : null,
        supervisor_contact_id: values.supervisor_contact_id || null,
        status,
        import_source: "Manual",
      }).select("employee_id").single();

      if (error) throw error;

      // Check phone number duplicates against DB
      const phone = values.mobile_number?.trim();
      if (phone && status === "Pending Invite") {
        const [{ data: contactDups }, { data: empDups }] = await Promise.all([
          supabase.from("employer_contacts").select("cellphone").eq("cellphone", phone).limit(1),
          supabase.from("employees").select("mobile_number").eq("mobile_number", phone).neq("employee_id", empData.employee_id).limit(1),
        ]);
        if ((contactDups && contactDups.length > 0) || (empDups && empDups.length > 0)) {
          toast.info(`Phone number ${phone} is already registered — linked to existing account.`);
        }
      }

      // Create auth account if email is provided and status is not Draft
      const email = values.email_address?.trim();
      if (email && status === "Pending Invite" && empData) {
        const tempPassword = generateTempPassword();
        const { data: fnData, error: fnError } = await supabase.functions.invoke("create-user-account", {
          body: {
            email,
            password: tempPassword,
            first_name: values.first_name,
            last_name: values.last_name,
            role: "employee",
            employer_id: values.employer_id,
            employee_id: empData.employee_id,
          },
        });

        if (fnError || fnData?.error) {
          toast.error("Employee saved, but account creation failed: " + (fnData?.error || fnError?.message));
        } else if (fnData?.already_existed) {
          toast.info(`${email} is already registered — linked to existing account.`);
        } else {
          toast.success("Employee added and account created.");
          setTempPasswordModal({ open: true, credentials: [{ email, password: tempPassword, role: "Employee", alreadyExisted: false }] });
          return; // Don't navigate yet — modal is open
        }
      } else {
        toast.success(
          status === "Pending Invite"
            ? "Employee added successfully."
            : "Employee saved as draft."
        );
      }

      navigate("/admin/employees");
    } catch (err: any) {
      toast.error(err.message || "Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Employee</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new employee record.
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-6">
            {/* Employer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employer</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="employer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Employer *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an employer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employers.map((emp) => (
                            <SelectItem key={emp.employer_id} value={emp.employer_id}>
                              {emp.company_legal_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employee_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="EMP001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="hidden md:block" />

                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sa_id_or_passport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SA ID or Passport Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="8501015009087" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter 13-digit SA ID or passport number. System will auto-detect the type.
                        {idDocType && (
                          <span className="ml-2 text-accent font-medium">
                            Detected: {idDocType === "sa_id" ? "SA ID" : "Passport"}
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Auto-filled if SA ID is entered.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="0XX XXX XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMPLOYMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employment_start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Employment Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gross_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Salary (ZAR) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="15000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Operations" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supervisor_contact_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              !selectedEmployerId
                                ? "Select an employer first"
                                : supervisors.length === 0
                                ? "No supervisors added"
                                : "Select supervisor"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {supervisors.length === 0 ? (
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                              No supervisors added — add supervisors during employer onboarding
                            </div>
                          ) : (
                            supervisors.map((sup) => (
                              <SelectItem key={sup.contact_id} value={sup.contact_id}>
                                {sup.first_name} {sup.last_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Banking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Banking Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Standard Bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ACCOUNT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSave("Draft")}
                disabled={loading}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={() => handleSave("Pending Invite")}
                disabled={loading}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <TempPasswordModal
        open={tempPasswordModal.open}
        onClose={() => {
          setTempPasswordModal({ open: false, email: "", password: "" });
          navigate("/admin/employees");
        }}
        email={tempPasswordModal.email}
        password={tempPasswordModal.password}
        role="employee"
      />
    </AdminLayout>
  );
}
