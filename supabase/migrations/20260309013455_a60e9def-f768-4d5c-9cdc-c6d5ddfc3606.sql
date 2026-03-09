
-- Fix employers RLS: RESTRICTIVE → PERMISSIVE for INSERT and UPDATE
DROP POLICY IF EXISTS "Lamoola staff insert employers" ON public.employers;
CREATE POLICY "Lamoola staff insert employers" ON public.employers AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (is_lamoola_staff(auth.uid()));

DROP POLICY IF EXISTS "Employer admin updates own company" ON public.employers;
CREATE POLICY "Employer admin updates own company" ON public.employers AS PERMISSIVE FOR UPDATE TO authenticated USING (employer_id = get_user_employer_id(auth.uid()) AND has_role(auth.uid(), 'employer_admin'::app_role));

DROP POLICY IF EXISTS "Lamoola staff update employers" ON public.employers;
CREATE POLICY "Lamoola staff update employers" ON public.employers AS PERMISSIVE FOR UPDATE TO authenticated USING (is_lamoola_staff(auth.uid()));

-- Fix employers SELECT policies to PERMISSIVE too
DROP POLICY IF EXISTS "Lamoola staff see all employers" ON public.employers;
CREATE POLICY "Lamoola staff see all employers" ON public.employers AS PERMISSIVE FOR SELECT TO authenticated USING (is_lamoola_staff(auth.uid()));

DROP POLICY IF EXISTS "Employer admin sees own company" ON public.employers;
CREATE POLICY "Employer admin sees own company" ON public.employers AS PERMISSIVE FOR SELECT TO authenticated USING (employer_id = get_user_employer_id(auth.uid()));

-- Fix audit_trail INSERT to PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users append audit" ON public.audit_trail;
CREATE POLICY "Authenticated users append audit" ON public.audit_trail AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Fix audit_trail SELECT to PERMISSIVE
DROP POLICY IF EXISTS "Lamoola staff read audit" ON public.audit_trail;
CREATE POLICY "Lamoola staff read audit" ON public.audit_trail AS PERMISSIVE FOR SELECT TO authenticated USING (is_lamoola_staff(auth.uid()));

-- Fix employer_contacts to PERMISSIVE
DROP POLICY IF EXISTS "Lamoola staff see all contacts" ON public.employer_contacts;
CREATE POLICY "Lamoola staff see all contacts" ON public.employer_contacts AS PERMISSIVE FOR SELECT TO authenticated USING (is_lamoola_staff(auth.uid()));

DROP POLICY IF EXISTS "Employer admin sees own contacts" ON public.employer_contacts;
CREATE POLICY "Employer admin sees own contacts" ON public.employer_contacts AS PERMISSIVE FOR SELECT TO authenticated USING (employer_id = get_user_employer_id(auth.uid()));

DROP POLICY IF EXISTS "Lamoola staff manage contacts" ON public.employer_contacts;
CREATE POLICY "Lamoola staff manage contacts" ON public.employer_contacts AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (is_lamoola_staff(auth.uid()));

DROP POLICY IF EXISTS "Lamoola staff update contacts" ON public.employer_contacts;
CREATE POLICY "Lamoola staff update contacts" ON public.employer_contacts AS PERMISSIVE FOR UPDATE TO authenticated USING (is_lamoola_staff(auth.uid()));

DROP POLICY IF EXISTS "Employer admin manages own contacts" ON public.employer_contacts;
CREATE POLICY "Employer admin manages own contacts" ON public.employer_contacts AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (employer_id = get_user_employer_id(auth.uid()) AND has_role(auth.uid(), 'employer_admin'::app_role));

DROP POLICY IF EXISTS "Employer admin updates own contacts" ON public.employer_contacts;
CREATE POLICY "Employer admin updates own contacts" ON public.employer_contacts AS PERMISSIVE FOR UPDATE TO authenticated USING (employer_id = get_user_employer_id(auth.uid()) AND has_role(auth.uid(), 'employer_admin'::app_role));

-- Also need DELETE on employer_contacts for the Step 4 flow (delete + re-insert)
CREATE POLICY "Lamoola staff delete contacts" ON public.employer_contacts AS PERMISSIVE FOR DELETE TO authenticated USING (is_lamoola_staff(auth.uid()));
