-- Fix infinite recursion in user_roles RLS policies

-- Drop the problematic policy
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;

-- Create a better policy that doesn't cause recursion
-- Allow authenticated users to read their own role
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own role (for registration)
CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Use service_role for admin operations instead of recursive policies
-- Admin operations should be handled in the application layer with proper service_role access