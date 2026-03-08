
-- =============================================
-- LAMOOLA EWA PLATFORM — MIGRATION 1: ENUMS & TABLES
-- =============================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'employer_admin', 'supervisor', 'hr_approver', 'employee');
CREATE TYPE public.employer_status AS ENUM ('Draft', 'Active', 'Suspended', 'Terminated');
CREATE TYPE public.employee_status AS ENUM ('Draft', 'Pending Invite', 'Active', 'On Hold', 'Terminated');
CREATE TYPE public.request_status AS ENUM ('Pending', 'Approved', 'Declined');
CREATE TYPE public.payout_status AS ENUM ('Processing', 'Paid', 'Failed');
CREATE TYPE public.bank_status AS ENUM ('Pending', 'Verified', 'Failed');
CREATE TYPE public.pay_cycle AS ENUM ('Weekly', 'Bi-weekly', 'Monthly');
CREATE TYPE public.id_doc_type AS ENUM ('sa_id', 'passport');
CREATE TYPE public.account_type AS ENUM ('Cheque', 'Savings', 'Transmission');
CREATE TYPE public.employment_type AS ENUM ('Permanent', 'Contract', 'Part-time', 'Seasonal');
CREATE TYPE public.contact_type AS ENUM ('general', 'authorised_representative');
CREATE TYPE public.approval_mode AS ENUM ('Auto-Approved', 'Supervisor Approval', 'HR Approval');
CREATE TYPE public.import_source AS ENUM ('Manual', 'Bulk Upload', 'API');
CREATE TYPE public.industry_sector AS ENUM ('Food & Beverage', 'Security', 'Cleaning', 'Retail', 'Construction', 'Logistics', 'Other');
CREATE TYPE public.payroll_format AS ENUM ('Standard Lamoola CSV', 'Sage Pastel', 'VIP Payroll', 'SARS EMP201', 'Custom CSV');
CREATE TYPE public.audit_action AS ENUM ('employer_created', 'employer_activated', 'employer_suspended', 'employer_terminated', 'employee_added', 'employee_terminated', 'request_submitted', 'request_approved', 'request_declined', 'payout_initiated', 'payout_completed', 'payout_failed', 'payout_retried', 'bank_verification_triggered', 'login', 'logout');

-- 2. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. EMPLOYERS TABLE
CREATE TABLE public.employers (
  employer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_legal_name TEXT NOT NULL,
  registration_number TEXT UNIQUE,
  vat_number TEXT,
  physical_address TEXT,
  industry_sector public.industry_sector,
  payroll_contact_first_name TEXT,
  payroll_contact_last_name TEXT,
  payroll_contact_email TEXT,
  payroll_contact_phone TEXT,
  pay_cycle public.pay_cycle NOT NULL,
  payday TEXT,
  payroll_period_start TEXT,
  payroll_period_end TEXT,
  payroll_export_format public.payroll_format,
  employer_approval_mode public.approval_mode NOT NULL DEFAULT 'Auto-Approved',
  max_percent_earned INT CHECK (max_percent_earned >= 1 AND max_percent_earned <= 100),
  max_per_transaction DECIMAL,
  max_per_pay_period DECIMAL,
  cutoff_days INT DEFAULT 0 CHECK (cutoff_days >= 0 AND cutoff_days <= 10),
  fee_percent DECIMAL DEFAULT 0,
  fee_flat_amount DECIMAL DEFAULT 0,
  settlement_method TEXT,
  status public.employer_status NOT NULL DEFAULT 'Draft',
  onboarding_progress TEXT DEFAULT '1 of 5 steps complete',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fee_required CHECK (fee_percent > 0 OR fee_flat_amount > 0)
);
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- 4. USER_ROLES TABLE (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  employer_id UUID REFERENCES public.employers(employer_id),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. EMPLOYER_CONTACTS TABLE
CREATE TABLE public.employer_contacts (
  contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(employer_id) ON DELETE CASCADE,
  contact_type public.contact_type NOT NULL,
  role_title TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  cellphone TEXT,
  landline TEXT
);
ALTER TABLE public.employer_contacts ENABLE ROW LEVEL SECURITY;

-- 6. EMPLOYEES TABLE
CREATE TABLE public.employees (
  employee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  employer_id UUID NOT NULL REFERENCES public.employers(employer_id) ON DELETE CASCADE,
  employee_number TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_document_type public.id_doc_type,
  sa_id_or_passport TEXT UNIQUE,
  date_of_birth DATE,
  mobile_number TEXT,
  email_address TEXT,
  employment_status public.employment_type,
  employment_start_date DATE,
  pay_cycle public.pay_cycle,
  payroll_period_start TEXT,
  payroll_period_end TEXT,
  payday TEXT,
  gross_salary DECIMAL,
  bank_name TEXT,
  bank_account_number TEXT,
  account_type public.account_type,
  account_holder_name TEXT,
  department TEXT,
  supervisor_name TEXT,
  approval_mode public.approval_mode,
  access_limit_override_percent INT,
  max_transaction_override DECIMAL,
  import_source public.import_source,
  notes TEXT,
  status public.employee_status NOT NULL DEFAULT 'Draft',
  bank_verification_status public.bank_status NOT NULL DEFAULT 'Pending',
  tcs_accepted BOOLEAN DEFAULT false,
  tcs_accepted_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employer_id, employee_number)
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- 7. REQUESTS TABLE
CREATE TABLE public.requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(employee_id),
  employer_id UUID NOT NULL REFERENCES public.employers(employer_id),
  amount_requested DECIMAL NOT NULL,
  service_fee DECIMAL,
  fee_percent_applied DECIMAL,
  fee_flat_applied DECIMAL,
  amount_to_receive DECIMAL,
  earned_salary_at_request DECIMAL,
  available_balance_at_request DECIMAL,
  approval_mode_applied public.approval_mode,
  request_status public.request_status NOT NULL DEFAULT 'Pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  declined_by UUID REFERENCES auth.users(id),
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  bank_account_masked TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- 8. PAYOUTS TABLE
CREATE TABLE public.payouts (
  payout_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(request_id),
  payout_status public.payout_status NOT NULL DEFAULT 'Processing',
  payout_initiated_at TIMESTAMPTZ,
  payout_initiated_by UUID REFERENCES auth.users(id),
  payout_completed_at TIMESTAMPTZ,
  payout_failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_count INT DEFAULT 0,
  batch_id TEXT
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- 9. CONTRACT_TEMPLATES TABLE
CREATE TABLE public.contract_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lamoola_legal_name TEXT,
  lamoola_alt_name TEXT,
  lamoola_registration_number TEXT,
  remittance_due_business_days INT DEFAULT 3,
  payment_method_primary TEXT,
  lamoola_notice_address TEXT,
  lamoola_notice_email TEXT,
  eft_bank TEXT,
  eft_account TEXT,
  eft_branch TEXT,
  eft_reference TEXT,
  signatory_name TEXT,
  signatory_title TEXT,
  signatory_location TEXT,
  signatory_date DATE,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

-- 10. AUDIT_TRAIL TABLE (append-only)
CREATE TABLE public.audit_trail (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  user_role public.app_role,
  action_type public.audit_action NOT NULL,
  object_type TEXT NOT NULL,
  object_id UUID,
  details JSONB,
  ip_address TEXT
);
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
