
-- Drop restrictive INSERT policies on employees
DROP POLICY "Employer admin inserts own employees" ON public.employees;
DROP POLICY "Lamoola staff insert employees" ON public.employees;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Employer admin inserts own employees"
ON public.employees
FOR INSERT TO authenticated
WITH CHECK (
  employer_id = get_user_employer_id(auth.uid())
  AND has_role(auth.uid(), 'employer_admin'::app_role)
);

CREATE POLICY "Lamoola staff insert employees"
ON public.employees
FOR INSERT TO authenticated
WITH CHECK (
  is_lamoola_staff(auth.uid())
);
