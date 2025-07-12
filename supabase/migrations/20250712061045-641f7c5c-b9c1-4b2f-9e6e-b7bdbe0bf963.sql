-- Create MCQ questions table
CREATE TABLE public.mcq_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee results table
CREATE TABLE public.employee_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  position TEXT NOT NULL,
  time_submitted TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_marks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for serial numbers
CREATE SEQUENCE public.employee_serial_seq START 1;

-- Enable Row Level Security
ALTER TABLE public.mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an admin-managed system)
CREATE POLICY "Allow all operations on mcq_questions" 
ON public.mcq_questions 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on employee_results" 
ON public.employee_results 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mcq_questions_updated_at
  BEFORE UPDATE ON public.mcq_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();