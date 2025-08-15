-- Add user roles and technician-specific tables for better role separation

-- Create user roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'technician', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create technicians table for technician-specific information
CREATE TABLE IF NOT EXISTS public.technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_services INTEGER DEFAULT 0 CHECK (total_services >= 0),
  service_areas TEXT[] NOT NULL DEFAULT '{}',
  certifications JSONB DEFAULT '[]'::jsonb,
  is_available BOOLEAN DEFAULT true,
  bio TEXT,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service reviews table
CREATE TABLE IF NOT EXISTS public.service_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL UNIQUE REFERENCES public.service_requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON public.technicians(user_id);
CREATE INDEX IF NOT EXISTS idx_technicians_is_available ON public.technicians(is_available);
CREATE INDEX IF NOT EXISTS idx_service_reviews_technician_id ON public.service_reviews(technician_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_customer_id ON public.service_reviews(customer_id);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Technicians policies
CREATE POLICY "Anyone can view available technicians" ON public.technicians
  FOR SELECT USING (is_available = true);

CREATE POLICY "Technicians can update their own profile" ON public.technicians
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Only technicians can insert their profile" ON public.technicians
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'technician'
    )
  );

-- Service reviews policies
CREATE POLICY "Anyone can view reviews" ON public.service_reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their completed services" ON public.service_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM public.service_requests
      WHERE id = service_request_id
        AND customer_id = auth.uid()
        AND status = 'completed'
    )
  );

CREATE POLICY "Customers can update their own reviews" ON public.service_reviews
  FOR UPDATE USING (auth.uid() = customer_id);

-- Create function to update technician rating after review
CREATE OR REPLACE FUNCTION public.update_technician_rating()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.technicians
  SET rating = (
    SELECT AVG(rating)::DECIMAL(3,2)
    FROM public.service_reviews
    WHERE technician_id = NEW.technician_id
  )
  WHERE user_id = NEW.technician_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update technician rating
CREATE TRIGGER update_technician_rating_trigger
  AFTER INSERT OR UPDATE ON public.service_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_technician_rating();

-- Create function to increment technician service count
CREATE OR REPLACE FUNCTION public.increment_technician_services()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.technicians
    SET total_services = total_services + 1
    WHERE user_id = NEW.technician_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to increment service count
CREATE TRIGGER increment_technician_services_trigger
  AFTER UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_technician_services();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON public.technicians
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.technicians;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_reviews;