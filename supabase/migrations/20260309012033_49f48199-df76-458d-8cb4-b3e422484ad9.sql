-- Fix RLS policy permissiveness on public.employers
-- Existing UPDATE policies were created as RESTRICTIVE (AND-combined), which can block Lamoola staff updates.

-- INSERT
DROP POLICY IF EXISTS "Lamoola staff insert employers" ON public.employers;

CREATE POLICY "Lamoola staff insert employers"
ON public.employers
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  is_lamoola_staff(auth.uid())
);

-- UPDATE
DROP POLICY IF EXISTS "Employer admin updates own company" ON public.employers;
DROP POLICY IF EXISTS "Lamoola staff update employers" ON public.employers;

CREATE POLICY "Employer admin updates own company"
ON public.employers
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  employer_id = get_user_employer_id(auth.uid())
  AND has_role(auth.uid(), 'employer_admin'::app_role)
);

CREATE POLICY "Lamoola staff update employers"
ON public.employers
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  is_lamoola_staff(auth.uid())
);
