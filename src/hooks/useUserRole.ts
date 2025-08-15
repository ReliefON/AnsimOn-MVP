import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/integrations/supabase/types-extended';

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Fetching user role for user ID:', user.id);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        console.error('User ID:', user.id);
        console.error('Error details:', error);
        
        // If user not found in user_roles table, default to customer
        if (error.code === 'PGRST116') { // Not found
          console.log('User not found in user_roles, defaulting to customer');
          setUserRole('customer');
        } else {
          // For other errors, still default to customer
          console.log('Database error, defaulting to customer');
          setUserRole('customer');
        }
      } else {
        console.log('User role fetched successfully:', data.role);
        setUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      console.error('User ID:', user.id);
      console.log('Exception occurred, defaulting to customer');
      setUserRole('customer'); // Default fallback
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    fetchUserRole();
  }, [user, fetchUserRole]);

  return { userRole, loading, refetch: fetchUserRole };
};