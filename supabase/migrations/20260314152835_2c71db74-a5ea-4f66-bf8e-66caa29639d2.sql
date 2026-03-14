
CREATE TABLE public.demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  employee_count TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit demo request"
ON public.demo_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Lamoola staff read demo requests"
ON public.demo_requests
FOR SELECT
TO authenticated
USING (public.is_lamoola_staff(auth.uid()));
