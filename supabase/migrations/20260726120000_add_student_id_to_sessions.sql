-- NOTE: student_sessions.student_id (uuid, FK -> profiles.id) and
-- student_sessions.class_id (uuid, FK -> classes.id) already exist as of
-- 20260717092517_remote_schema.sql, which also DROPPED the old text columns
-- `name` and `class_code`. This migration only adds indexes on the columns
-- that actually exist today.
CREATE INDEX IF NOT EXISTS idx_student_sessions_student_id
    ON public.student_sessions (student_id);

CREATE INDEX IF NOT EXISTS idx_student_sessions_class_id
    ON public.student_sessions (class_id);