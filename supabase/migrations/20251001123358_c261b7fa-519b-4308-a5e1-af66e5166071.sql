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

-- Create birds/flock table
CREATE TABLE public.flocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flock_name TEXT NOT NULL,
  bird_type TEXT NOT NULL,
  initial_count INTEGER NOT NULL,
  current_count INTEGER NOT NULL,
  hatch_date DATE,
  breed TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deceased')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create egg production table
CREATE TABLE public.egg_production (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flock_id UUID REFERENCES public.flocks(id) ON DELETE CASCADE,
  collection_date DATE NOT NULL,
  eggs_collected INTEGER NOT NULL,
  broken_eggs INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('eggs', 'birds', 'meat', 'other')),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  sale_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partial')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create mortality tracking table
CREATE TABLE public.mortality_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flock_id UUID REFERENCES public.flocks(id) ON DELETE CASCADE,
  death_date DATE NOT NULL,
  death_count INTEGER NOT NULL,
  cause TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create vaccination/health records table
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flock_id UUID REFERENCES public.flocks(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'treatment', 'checkup')),
  record_date DATE NOT NULL,
  medication_vaccine TEXT,
  dosage TEXT,
  administered_by TEXT,
  notes TEXT,
  next_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  farm_name TEXT,
  owner_name TEXT,
  phone TEXT,
  address TEXT,
  farm_size TEXT,
  established_date DATE,
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create feed inventory table
CREATE TABLE public.feed_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_name TEXT NOT NULL,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  minimum_stock DECIMAL(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  cost_per_unit DECIMAL(10,2),
  supplier TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT false,
  related_table TEXT,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feed_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egg_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortality_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for flocks
CREATE POLICY "Users can manage their own flocks" ON public.flocks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for egg_production
CREATE POLICY "Users can manage their own egg production" ON public.egg_production FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sales
CREATE POLICY "Users can manage their own sales" ON public.sales FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mortality_records
CREATE POLICY "Users can manage their own mortality records" ON public.mortality_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for health_records
CREATE POLICY "Users can manage their own health records" ON public.health_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_profiles
CREATE POLICY "Users can manage their own profile" ON public.user_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for feed_inventory
CREATE POLICY "Users can manage their own feed inventory" ON public.feed_inventory FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

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

CREATE TRIGGER update_flocks_updated_at
  BEFORE UPDATE ON public.flocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_egg_production_updated_at
  BEFORE UPDATE ON public.egg_production
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mortality_records_updated_at
  BEFORE UPDATE ON public.mortality_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON public.health_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feed_inventory_updated_at
  BEFORE UPDATE ON public.feed_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create views for reporting
CREATE VIEW public.daily_production AS
SELECT 
  user_id,
  collection_date,
  SUM(eggs_collected) as total_eggs,
  SUM(broken_eggs) as total_broken
FROM public.egg_production 
GROUP BY user_id, collection_date;

CREATE VIEW public.financial_summary AS
SELECT 
  user_id,
  'income' as type,
  SUM(total_amount) as amount,
  EXTRACT(MONTH FROM sale_date) as month,
  EXTRACT(YEAR FROM sale_date) as year
FROM public.sales 
GROUP BY user_id, EXTRACT(MONTH FROM sale_date), EXTRACT(YEAR FROM sale_date)
UNION ALL
SELECT 
  user_id,
  'feed_expense' as type,
  SUM(total_cost) as amount,
  EXTRACT(MONTH FROM purchase_date) as month,
  EXTRACT(YEAR FROM purchase_date) as year
FROM public.feed_purchases 
GROUP BY user_id, EXTRACT(MONTH FROM purchase_date), EXTRACT(YEAR FROM purchase_date)
UNION ALL
SELECT 
  user_id,
  'other_expense' as type,
  SUM(amount) as amount,
  EXTRACT(MONTH FROM expense_date) as month,
  EXTRACT(YEAR FROM expense_date) as year
FROM public.expenses 
GROUP BY user_id, EXTRACT(MONTH FROM expense_date), EXTRACT(YEAR FROM expense_date);

-- Enable RLS on views
ALTER VIEW public.daily_production SET (security_invoker = true);
ALTER VIEW public.financial_summary SET (security_invoker = true);

-- Create comprehensive dashboard view
CREATE VIEW public.dashboard_stats AS
SELECT 
  u.user_id,
  -- Flock stats
  COALESCE(f.total_birds, 0) as total_birds,
  COALESCE(f.active_flocks, 0) as active_flocks,
  -- Production stats (last 30 days)
  COALESCE(ep.avg_daily_eggs, 0) as avg_daily_eggs,
  COALESCE(ep.total_eggs_month, 0) as total_eggs_month,
  -- Financial stats (current month)
  COALESCE(fs.total_income, 0) as total_income,
  COALESCE(fs.total_expenses, 0) as total_expenses,
  COALESCE(fs.total_income - fs.total_expenses, 0) as net_profit,
  -- Recent mortality
  COALESCE(mr.deaths_this_week, 0) as deaths_this_week
FROM (SELECT DISTINCT user_id FROM public.flocks) u
LEFT JOIN (
  SELECT 
    user_id,
    SUM(current_count) as total_birds,
    COUNT(*) FILTER (WHERE status = 'active') as active_flocks
  FROM public.flocks 
  GROUP BY user_id
) f ON u.user_id = f.user_id
LEFT JOIN (
  SELECT 
    user_id,
    AVG(eggs_collected) as avg_daily_eggs,
    SUM(eggs_collected) as total_eggs_month
  FROM public.egg_production 
  WHERE collection_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
) ep ON u.user_id = ep.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type != 'income' THEN amount ELSE 0 END) as total_expenses
  FROM public.financial_summary 
  WHERE month = EXTRACT(MONTH FROM CURRENT_DATE) 
    AND year = EXTRACT(YEAR FROM CURRENT_DATE)
  GROUP BY user_id
) fs ON u.user_id = fs.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(death_count) as deaths_this_week
  FROM public.mortality_records 
  WHERE death_date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY user_id
) mr ON u.user_id = mr.user_id;

-- Function to update flock count after mortality
CREATE OR REPLACE FUNCTION update_flock_count_on_mortality()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.flocks 
  SET current_count = GREATEST(0, current_count - NEW.death_count)
  WHERE id = NEW.flock_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_flock_count_mortality
  AFTER INSERT ON public.mortality_records
  FOR EACH ROW EXECUTE FUNCTION update_flock_count_on_mortality();

-- Function to create low stock notifications
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock <= NEW.minimum_stock AND NEW.minimum_stock > 0 THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_table, related_id)
    VALUES (
      NEW.user_id,
      'Low Stock Alert',
      'Feed "' || NEW.feed_name || '" is running low. Current stock: ' || NEW.current_stock || ' ' || NEW.unit,
      'warning',
      'feed_inventory',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_feed_stock
  AFTER UPDATE ON public.feed_inventory
  FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- Enable RLS on dashboard view
ALTER VIEW public.dashboard_stats SET (security_invoker = true);