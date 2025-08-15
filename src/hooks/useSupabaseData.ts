import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SafetyPartner {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  relationship: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  technician_id: string | null;
  customer_name: string;
  technician_name: string | null;
  service_type: string;
  location: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'monitoring' | 'completed';
  start_time: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user found' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { error };
    }

    setProfile(data);
    return { data, error: null };
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};

export const useSafetyPartners = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState<SafetyPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPartners([]);
      setLoading(false);
      return;
    }

    fetchPartners();
  }, [user]);

  const fetchPartners = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('safety_partners')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching safety partners:', error);
    } else {
      setPartners(data || []);
    }
    setLoading(false);
  };

  const addPartner = async (partner: Omit<SafetyPartner, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'No user found' };

    const { data, error } = await supabase
      .from('safety_partners')
      .insert({ ...partner, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error adding safety partner:', error);
      return { error };
    }

    setPartners(prev => [data, ...prev]);
    return { data, error: null };
  };

  const removePartner = async (partnerId: string) => {
    const { error } = await supabase
      .from('safety_partners')
      .delete()
      .eq('id', partnerId);

    if (error) {
      console.error('Error removing safety partner:', error);
      return { error };
    }

    setPartners(prev => prev.filter(p => p.id !== partnerId));
    return { error: null };
  };

  return { partners, loading, addPartner, removePartner, refetch: fetchPartners };
};

export const useServiceRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    fetchRequests();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('service_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
          filter: `customer_id=eq.${user.id}`,
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .or(`customer_id.eq.${user.id},technician_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching service requests:', error);
    } else {
      setRequests((data || []) as ServiceRequest[]);
    }
    setLoading(false);
  };

  const createRequest = async (request: {
    customer_name: string;
    technician_name: string;
    service_type: string;
    location: string;
    scheduled_date: string;
    scheduled_time: string;
  }) => {
    if (!user) return { error: 'No user found' };

    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        ...request,
        customer_id: user.id,
        technician_id: null,
        status: 'pending',
        start_time: null,
        completed_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service request:', error);
      return { error };
    }

    setRequests(prev => [data as ServiceRequest, ...prev]);
    return { data: data as ServiceRequest, error: null };
  };

  const updateRequest = async (requestId: string, updates: Partial<ServiceRequest>) => {
    const { data, error } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating service request:', error);
      return { error };
    }

    if (data) {
      setRequests(prev => prev.map(req => req.id === requestId ? data as ServiceRequest : req));
      return { data: data as ServiceRequest, error: null };
    }
    
    // If no data returned, still update the local state
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, ...updates } as ServiceRequest 
        : req
    ));
    
    return { data: null, error: null };
  };

  return { requests, loading, createRequest, updateRequest, refetch: fetchRequests };
};