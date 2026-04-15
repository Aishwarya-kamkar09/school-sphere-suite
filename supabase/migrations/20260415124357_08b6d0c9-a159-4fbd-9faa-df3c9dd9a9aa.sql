
-- Fix students table policies
DROP POLICY IF EXISTS "Allow insert for auth" ON public.students;
DROP POLICY IF EXISTS "Allow update for auth" ON public.students;
DROP POLICY IF EXISTS "Allow delete for auth" ON public.students;
CREATE POLICY "teachers_insert_students" ON public.students FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_update_students" ON public.students FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_delete_students" ON public.students FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Fix attendance
DROP POLICY IF EXISTS "Allow insert for auth" ON public.attendance;
DROP POLICY IF EXISTS "Allow update for auth" ON public.attendance;
DROP POLICY IF EXISTS "Allow delete for auth" ON public.attendance;
CREATE POLICY "teachers_insert_attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_update_attendance" ON public.attendance FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_delete_attendance" ON public.attendance FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Fix fees
DROP POLICY IF EXISTS "Allow insert for auth" ON public.fees;
DROP POLICY IF EXISTS "Allow update for auth" ON public.fees;
DROP POLICY IF EXISTS "Allow delete for auth" ON public.fees;
CREATE POLICY "teachers_insert_fees" ON public.fees FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_update_fees" ON public.fees FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_delete_fees" ON public.fees FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Fix exams
DROP POLICY IF EXISTS "Allow insert for auth" ON public.exams;
DROP POLICY IF EXISTS "Allow update for auth" ON public.exams;
DROP POLICY IF EXISTS "Allow delete for auth" ON public.exams;
CREATE POLICY "teachers_insert_exams" ON public.exams FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_update_exams" ON public.exams FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_delete_exams" ON public.exams FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Fix grades
DROP POLICY IF EXISTS "Allow insert for auth" ON public.grades;
DROP POLICY IF EXISTS "Allow update for auth" ON public.grades;
DROP POLICY IF EXISTS "Allow delete for auth" ON public.grades;
CREATE POLICY "teachers_insert_grades" ON public.grades FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_update_grades" ON public.grades FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_delete_grades" ON public.grades FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Fix library_books
DROP POLICY IF EXISTS "Allow insert for auth" ON public.library_books;
DROP POLICY IF EXISTS "Allow update for auth" ON public.library_books;
DROP POLICY IF EXISTS "Allow delete for auth" ON public.library_books;
CREATE POLICY "teachers_insert_library_books" ON public.library_books FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_update_library_books" ON public.library_books FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_delete_library_books" ON public.library_books FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Fix book_issues
DROP POLICY IF EXISTS "Allow insert for auth" ON public.book_issues;
DROP POLICY IF EXISTS "Allow update for auth" ON public.book_issues;
DROP POLICY IF EXISTS "Allow delete for auth" ON public.book_issues;
CREATE POLICY "teachers_insert_book_issues" ON public.book_issues FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_update_book_issues" ON public.book_issues FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_delete_book_issues" ON public.book_issues FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Fix school_info
DROP POLICY IF EXISTS "Allow insert for auth" ON public.school_info;
DROP POLICY IF EXISTS "Allow update for auth" ON public.school_info;
DROP POLICY IF EXISTS "Allow delete for auth" ON public.school_info;
CREATE POLICY "teachers_insert_school_info" ON public.school_info FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_update_school_info" ON public.school_info FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "teachers_delete_school_info" ON public.school_info FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
