-- Allow employee-role users to update their own employee record for T&Cs acceptance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'employees'
      AND policyname = 'Employee updates own TCs'
  ) THEN
    CREATE POLICY "Employee updates own TCs"
      ON public.employees
      FOR UPDATE
      TO authenticated
      USING (
        user_id = auth.uid()
        AND public.has_role(auth.uid(), 'employee'::public.app_role)
      )
      WITH CHECK (
        user_id = auth.uid()
        AND public.has_role(auth.uid(), 'employee'::public.app_role)
      );
  END IF;
END
$$;

-- Enforce that employee self-updates can only modify T&Cs fields
CREATE OR REPLACE FUNCTION public.enforce_employee_tcs_only_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NEW.user_id = auth.uid()
     AND public.has_role(auth.uid(), 'employee'::public.app_role)
     AND NOT public.is_lamoola_staff(auth.uid())
  THEN
    IF (
      to_jsonb(NEW) - ARRAY['tcs_accepted', 'tcs_accepted_date', 'updated_at']
    ) IS DISTINCT FROM (
      to_jsonb(OLD) - ARRAY['tcs_accepted', 'tcs_accepted_date', 'updated_at']
    ) THEN
      RAISE EXCEPTION 'Employees may only update tcs_accepted and tcs_accepted_date';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_employee_tcs_only_update ON public.employees;

CREATE TRIGGER trg_enforce_employee_tcs_only_update
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.enforce_employee_tcs_only_update();