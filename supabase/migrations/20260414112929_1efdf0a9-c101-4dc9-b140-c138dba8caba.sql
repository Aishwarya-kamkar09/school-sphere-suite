
-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  admission_no TEXT NOT NULL UNIQUE,
  usn TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  parent_name TEXT,
  parent_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT,
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create grades table
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  marks_obtained INTEGER NOT NULL,
  grade TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

-- Create fees table
CREATE TABLE public.fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  receipt_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create library_books table
CREATE TABLE public.library_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  category TEXT,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create book_issues table
CREATE TABLE public.book_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  status TEXT NOT NULL DEFAULT 'issued',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create school_info table
CREATE TABLE public.school_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_info ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow authenticated users full access
CREATE POLICY "Allow read for all" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert for auth" ON public.students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for auth" ON public.students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for auth" ON public.students FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow read for all" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert for auth" ON public.attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for auth" ON public.attendance FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for auth" ON public.attendance FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow read for all" ON public.exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert for auth" ON public.exams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for auth" ON public.exams FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for auth" ON public.exams FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow read for all" ON public.grades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert for auth" ON public.grades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for auth" ON public.grades FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for auth" ON public.grades FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow read for all" ON public.fees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert for auth" ON public.fees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for auth" ON public.fees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for auth" ON public.fees FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow read for all" ON public.library_books FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert for auth" ON public.library_books FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for auth" ON public.library_books FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for auth" ON public.library_books FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow read for all" ON public.book_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert for auth" ON public.book_issues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for auth" ON public.book_issues FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for auth" ON public.book_issues FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow read for all" ON public.school_info FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert for auth" ON public.school_info FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for auth" ON public.school_info FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for auth" ON public.school_info FOR DELETE TO authenticated USING (true);

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON public.fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_library_books_updated_at BEFORE UPDATE ON public.library_books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
