CREATE TABLE public.course_feedback (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  class_code text,
  student_name text,
  student_id text,
  is_anonymous boolean DEFAULT false NOT NULL,
  comment text NOT NULL
);

ALTER TABLE public.course_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_feedback ADD CONSTRAINT course_feedback_pkey PRIMARY KEY (id);

GRANT ALL ON public.course_feedback TO anon;
GRANT ALL ON public.course_feedback TO authenticated;
GRANT ALL ON public.course_feedback TO service_role;

CREATE POLICY "Allow public insert" ON public.course_feedback
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public read" ON public.course_feedback
  FOR SELECT TO anon, authenticated USING (true);
