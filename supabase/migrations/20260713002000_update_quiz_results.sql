ALTER TABLE public.quiz_results
    ADD COLUMN IF NOT EXISTS name text;

ALTER TABLE public.quiz_results
    ADD COLUMN IF NOT EXISTS class_code text;