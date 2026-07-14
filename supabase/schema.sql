-- ==========================================
-- STADIUMOS AI - DATABASE SCHEMA
-- Built for FIFA World Cup 2026 Stadium Operating System
-- ==========================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------
-- 1. PROFILES TABLE
-- ----------------------------------------------------
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('fan', 'organizer', 'security', 'volunteer', 'medical', 'accessibility', 'transport', 'sustainability', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ----------------------------------------------------
-- 2. CROWD DENSITY TABLE
-- ----------------------------------------------------
CREATE TABLE public.crowd_density (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  zone TEXT NOT NULL UNIQUE,
  density INTEGER NOT NULL CHECK (density >= 0 AND density <= 100),
  capacity INTEGER NOT NULL,
  current_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('low', 'moderate', 'high', 'critical')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crowd_density ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crowd density is viewable by authenticated users"
  ON public.crowd_density FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only organizers and security can modify crowd data"
  ON public.crowd_density FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('organizer', 'security', 'admin')
    )
  );

-- ----------------------------------------------------
-- 3. ACTIVE VISITORS TABLE
-- ----------------------------------------------------
CREATE TABLE public.active_visitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  total INTEGER NOT NULL,
  fans INTEGER NOT NULL,
  staff INTEGER NOT NULL,
  vip INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.active_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active visitors counts are viewable by authenticated users"
  ON public.active_visitors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only organizers and admin can update active visitors"
  ON public.active_visitors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('organizer', 'admin')
    )
  );

-- ----------------------------------------------------
-- 4. EMERGENCY ALERTS TABLE
-- ----------------------------------------------------
CREATE TABLE public.emergency_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'investigating')),
  assigned_team TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Emergency alerts are viewable by all authenticated users"
  ON public.emergency_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Security, medical, organizers, and admins can insert alerts"
  ON public.emergency_alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('security', 'medical', 'organizer', 'admin')
    )
  );

CREATE POLICY "Security, medical, organizers, and admins can update alerts"
  ON public.emergency_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('security', 'medical', 'organizer', 'admin')
    )
  );

-- ----------------------------------------------------
-- 5. TRANSPORT STATUS TABLE
-- ----------------------------------------------------
CREATE TABLE public.transport_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('bus', 'train', 'metro', 'shuttle')),
  line_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('on-time', 'delayed', 'suspended')),
  eta_minutes INTEGER NOT NULL,
  occupancy TEXT NOT NULL CHECK (occupancy IN ('low', 'medium', 'high')),
  delay_reason TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.transport_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transport status is viewable by authenticated users"
  ON public.transport_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Transport staff, organizers and admins can modify transport data"
  ON public.transport_status FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('transport', 'organizer', 'admin')
    )
  );

-- ----------------------------------------------------
-- 6. ACCESSIBILITY REQUESTS TABLE
-- ----------------------------------------------------
CREATE TABLE public.accessibility_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('wheelchair', 'guide', 'sensory', 'sign-language', 'other')),
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  assigned_staff TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.accessibility_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accessibility requests viewable by staff"
  ON public.accessibility_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone authenticated can create accessibility requests"
  ON public.accessibility_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Accessibility staff, volunteers, organizers, and admins can edit requests"
  ON public.accessibility_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('accessibility', 'volunteer', 'organizer', 'admin')
    )
  );

-- ----------------------------------------------------
-- 7. SUSTAINABILITY METRICS TABLE
-- ----------------------------------------------------
CREATE TABLE public.sustainability_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  energy_usage_kw INTEGER NOT NULL,
  renewable_percentage INTEGER NOT NULL,
  carbon_offset_kg INTEGER NOT NULL,
  waste_recycled_kg INTEGER NOT NULL,
  water_saved_litres INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.sustainability_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sustainability metrics viewable by authenticated users"
  ON public.sustainability_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sustainability staff, organizers, and admins can edit metrics"
  ON public.sustainability_metrics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('sustainability', 'organizer', 'admin')
    )
  );

-- ----------------------------------------------------
-- 8. VOLUNTEER ACTIVITY TABLE
-- ----------------------------------------------------
CREATE TABLE public.volunteer_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  task TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('idle', 'on-duty', 'break')),
  check_in_time TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.volunteer_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteer activity viewable by staff"
  ON public.volunteer_activity FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Volunteer managers, organizers, and admins can edit volunteer activity"
  ON public.volunteer_activity FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('organizer', 'admin', 'volunteer')
    )
  );

-- ----------------------------------------------------
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Staff Member'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'organizer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
