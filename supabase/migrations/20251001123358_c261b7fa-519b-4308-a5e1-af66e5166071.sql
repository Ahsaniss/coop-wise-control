-- Create feed_purchases table
CREATE TABLE public.feed_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_name TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create staff table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create staff_payments table
CREATE TABLE public.staff_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feed_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feed_purchases
CREATE POLICY "Users can view their own feed purchases"
  ON public.feed_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feed purchases"
  ON public.feed_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feed purchases"
  ON public.feed_purchases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feed purchases"
  ON public.feed_purchases FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for expenses
CREATE POLICY "Users can view their own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for staff
CREATE POLICY "Users can view their own staff"
  ON public.staff FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own staff"
  ON public.staff FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own staff"
  ON public.staff FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own staff"
  ON public.staff FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for staff_payments
CREATE POLICY "Users can view their own staff payments"
  ON public.staff_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own staff payments"
  ON public.staff_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own staff payments"
  ON public.staff_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own staff payments"
  ON public.staff_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_feed_purchases_updated_at
  BEFORE UPDATE ON public.feed_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_payments_updated_at
  BEFORE UPDATE ON public.staff_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();