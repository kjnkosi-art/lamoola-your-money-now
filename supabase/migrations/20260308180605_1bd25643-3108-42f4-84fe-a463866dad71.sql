
-- =============================================
-- LAMOOLA — MIGRATION 2: SECURITY FUNCTIONS & RLS POLICIES
-- =============================================

-- 1. SECURITY DEFINER FUNCTIONS

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get employer_id for a user (from user_roles)
CREATE OR REPLACE FUNCTION public.get_user_employer_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT employer_id FROM public.user_roles
  WHERE user_id = _user_id AND employer_id IS NOT NULL
  LIMIT 1
$$;

-- Helper: check if user is lamoola admin or owner
CREATE OR REPLACE FUNCTION public.is_lamoola_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('owner', 'admin')
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. RLS POLICIES

-- === PROFILES ===
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "System inserts profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- === USER_ROLES ===
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Lamoola staff manage roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Lamoola staff update roles" ON public.user_roles
  FOR UPDATE USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Lamoola staff delete roles" ON public.user_roles
  FOR DELETE USING (public.is_lamoola_staff(auth.uid()));

-- === EMPLOYERS ===
CREATE POLICY "Lamoola staff see all employers" ON public.employers
  FOR SELECT USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Employer admin sees own company" ON public.employers
  FOR SELECT USING (employer_id = public.get_user_employer_id(auth.uid()));

CREATE POLICY "Lamoola staff insert employers" ON public.employers
  FOR INSERT WITH CHECK (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Lamoola staff update employers" ON public.employers
  FOR UPDATE USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Employer admin updates own company" ON public.employers
  FOR UPDATE USING (
    employer_id = public.get_user_employer_id(auth.uid())
    AND public.has_role(auth.uid(), 'employer_admin')
  );

-- === EMPLOYER_CONTACTS ===
CREATE POLICY "Lamoola staff see all contacts" ON public.employer_contacts
  FOR SELECT USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Employer admin sees own contacts" ON public.employer_contacts
  FOR SELECT USING (employer_id = public.get_user_employer_id(auth.uid()));

CREATE POLICY "Lamoola staff manage contacts" ON public.employer_contacts
  FOR INSERT WITH CHECK (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Lamoola staff update contacts" ON public.employer_contacts
  FOR UPDATE USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Employer admin manages own contacts" ON public.employer_contacts
  FOR INSERT WITH CHECK (
    employer_id = public.get_user_employer_id(auth.uid())
    AND public.has_role(auth.uid(), 'employer_admin')
  );

CREATE POLICY "Employer admin updates own contacts" ON public.employer_contacts
  FOR UPDATE USING (
    employer_id = public.get_user_employer_id(auth.uid())
    AND public.has_role(auth.uid(), 'employer_admin')
  );

-- === EMPLOYEES ===
CREATE POLICY "Lamoola staff see all employees" ON public.employees
  FOR SELECT USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Employer admin sees own employees" ON public.employees
  FOR SELECT USING (employer_id = public.get_user_employer_id(auth.uid()));

CREATE POLICY "Employee sees own record" ON public.employees
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Lamoola staff insert employees" ON public.employees
  FOR INSERT WITH CHECK (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Employer admin inserts own employees" ON public.employees
  FOR INSERT WITH CHECK (
    employer_id = public.get_user_employer_id(auth.uid())
    AND public.has_role(auth.uid(), 'employer_admin')
  );

CREATE POLICY "Lamoola staff update employees" ON public.employees
  FOR UPDATE USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Employer admin updates own employees" ON public.employees
  FOR UPDATE USING (
    employer_id = public.get_user_employer_id(auth.uid())
    AND public.has_role(auth.uid(), 'employer_admin')
  );

-- === REQUESTS ===
CREATE POLICY "Lamoola staff see all requests" ON public.requests
  FOR SELECT USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Employer scoped see requests" ON public.requests
  FOR SELECT USING (employer_id = public.get_user_employer_id(auth.uid()));

CREATE POLICY "Employee sees own requests" ON public.requests
  FOR SELECT USING (
    employee_id IN (SELECT employee_id FROM public.employees WHERE user_id = auth.uid())
  );

CREATE POLICY "Employee creates own request" ON public.requests
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT employee_id FROM public.employees WHERE user_id = auth.uid())
  );

CREATE POLICY "Approver updates requests" ON public.requests
  FOR UPDATE USING (
    employer_id = public.get_user_employer_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'supervisor')
      OR public.has_role(auth.uid(), 'hr_approver')
      OR public.has_role(auth.uid(), 'employer_admin')
    )
  );

CREATE POLICY "Lamoola staff update requests" ON public.requests
  FOR UPDATE USING (public.is_lamoola_staff(auth.uid()));

-- === PAYOUTS ===
CREATE POLICY "Lamoola staff see all payouts" ON public.payouts
  FOR SELECT USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Employer admin sees own payouts" ON public.payouts
  FOR SELECT USING (
    request_id IN (
      SELECT request_id FROM public.requests WHERE employer_id = public.get_user_employer_id(auth.uid())
    )
  );

CREATE POLICY "Lamoola staff manage payouts" ON public.payouts
  FOR INSERT WITH CHECK (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Lamoola staff update payouts" ON public.payouts
  FOR UPDATE USING (public.is_lamoola_staff(auth.uid()));

-- === CONTRACT_TEMPLATES ===
CREATE POLICY "Lamoola staff see templates" ON public.contract_templates
  FOR SELECT USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Lamoola staff manage templates" ON public.contract_templates
  FOR INSERT WITH CHECK (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Lamoola staff update templates" ON public.contract_templates
  FOR UPDATE USING (public.is_lamoola_staff(auth.uid()));

-- === AUDIT_TRAIL ===
CREATE POLICY "Lamoola staff read audit" ON public.audit_trail
  FOR SELECT USING (public.is_lamoola_staff(auth.uid()));

CREATE POLICY "Authenticated users append audit" ON public.audit_trail
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- No UPDATE or DELETE policies on audit_trail (append-only)

-- 3. UPDATED_AT TRIGGERS
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON public.employers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
