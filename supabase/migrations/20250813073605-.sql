-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create safety partners table
CREATE TABLE public.safety_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service requests table
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  technician_name TEXT,
  service_type TEXT NOT NULL,
  location TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'monitoring', 'completed')),
  start_time TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monitoring sessions table
CREATE TABLE public.monitoring_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'emergency')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency alerts table
CREATE TABLE public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monitoring_session_id UUID NOT NULL REFERENCES public.monitoring_sessions(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'emergency' CHECK (alert_type IN ('emergency', 'panic', 'timeout')),
  location TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Safety partners policies
CREATE POLICY "Users can view their own safety partners" ON public.safety_partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own safety partners" ON public.safety_partners
  FOR ALL USING (auth.uid() = user_id);

-- Service requests policies
CREATE POLICY "Customers can view their own requests" ON public.service_requests
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Technicians can view requests assigned to them" ON public.service_requests
  FOR SELECT USING (auth.uid() = technician_id);

CREATE POLICY "Customers can create service requests" ON public.service_requests
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Technicians can update assigned requests" ON public.service_requests
  FOR UPDATE USING (auth.uid() = technician_id);

-- Monitoring sessions policies
CREATE POLICY "Users can view their monitoring sessions" ON public.monitoring_sessions
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = technician_id);

CREATE POLICY "Technicians can create monitoring sessions" ON public.monitoring_sessions
  FOR INSERT WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "Participants can update monitoring sessions" ON public.monitoring_sessions
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = technician_id);

-- Emergency alerts policies
CREATE POLICY "Users can view their emergency alerts" ON public.emergency_alerts
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = technician_id);

CREATE POLICY "Participants can create emergency alerts" ON public.emergency_alerts
  FOR INSERT WITH CHECK (auth.uid() = customer_id OR auth.uid() = technician_id);

CREATE POLICY "Participants can update emergency alerts" ON public.emergency_alerts
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = technician_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_safety_partners_updated_at
  BEFORE UPDATE ON public.safety_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitoring_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();