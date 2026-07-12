CREATE POLICY "Allow anon read classes" ON public.classes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert classes" ON public.classes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon insert enrollments" ON public.enrollments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon read enrollments" ON public.enrollments FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert quiz_results" ON public.quiz_results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon read quiz_results" ON public.quiz_results FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert lessons" ON public.lessons FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon read lessons" ON public.lessons FOR SELECT TO anon USING (true);