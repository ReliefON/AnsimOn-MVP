import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useServiceRequests, ServiceRequest } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

export type ServiceStatus = 'idle' | 'pending' | 'accepted' | 'monitoring' | 'completed';
export type UserType = 'customer' | 'technician' | null;

interface ServiceInfo {
  technicianName: string;
  serviceType: string;
  scheduledDate: Date;
  scheduledTime: string;
  startTime?: Date;
  location: string;
}

interface ServiceContextType {
  status: ServiceStatus;
  serviceInfo: ServiceInfo | null;
  emergencyTriggered: boolean;
  userType: UserType;
  serviceRequests: ServiceRequest[];
  currentServiceId: string | null;
  statusChangeFlags: { [key: string]: boolean };
  requestService: (info: ServiceInfo) => void;
  acceptService: () => void;
  rejectService: () => void;
  startMonitoring: () => void;
  endMonitoring: () => void;
  triggerEmergency: () => void;
  resetService: () => void;
  loginAs: (type: UserType) => void;
  logout: () => void;
  acceptServiceRequest: (requestId: string) => void;
  rejectServiceRequest: (requestId: string) => void;
  getCurrentRequest: () => ServiceRequest | null;
  clearStatusChangeFlag: (flag: string) => void;
  loading: boolean;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const { requests, loading: requestsLoading, createRequest, updateRequest } = useServiceRequests();
  const [status, setStatus] = useState<ServiceStatus>('idle');
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [statusChangeFlags, setStatusChangeFlags] = useState<{ [key: string]: boolean }>({});

  // Set user type based on role
  useEffect(() => {
    if (userRole) {
      setUserType(userRole as UserType);
    }
  }, [userRole]);

  // Determine current service status based on requests
  useEffect(() => {
    if (!user || !requests.length) {
      setStatus('idle');
      setCurrentServiceId(null);
      setServiceInfo(null);
      return;
    }

    // Find active request for current user
    const activeRequest = requests.find(req => 
      (req.customer_id === user.id || req.technician_id === user.id) && 
      ['pending', 'accepted', 'monitoring'].includes(req.status)
    );

    if (activeRequest) {
      setCurrentServiceId(activeRequest.id);
      setStatus(activeRequest.status as ServiceStatus);
      
      // Convert database request to ServiceInfo
      setServiceInfo({
        technicianName: activeRequest.technician_name || '',
        serviceType: activeRequest.service_type,
        scheduledDate: new Date(activeRequest.scheduled_date),
        scheduledTime: activeRequest.scheduled_time,
        location: activeRequest.location,
        startTime: activeRequest.start_time ? new Date(activeRequest.start_time) : undefined
      });
    } else {
      setStatus('idle');
      setCurrentServiceId(null);
      setServiceInfo(null);
    }
  }, [user, requests]);

  // Save critical state to localStorage
  useEffect(() => {
    localStorage.setItem('serviceStatus', status);
  }, [status]);

  useEffect(() => {
    if (serviceInfo) {
      localStorage.setItem('serviceInfo', JSON.stringify(serviceInfo));
    } else {
      localStorage.removeItem('serviceInfo');
    }
  }, [serviceInfo]);

  useEffect(() => {
    localStorage.setItem('emergencyTriggered', JSON.stringify(emergencyTriggered));
  }, [emergencyTriggered]);

  useEffect(() => {
    if (userType) {
      localStorage.setItem('userType', userType);
    } else {
      localStorage.removeItem('userType');
    }
  }, [userType]);

  useEffect(() => {
    if (currentServiceId) {
      localStorage.setItem('currentServiceId', currentServiceId);
    } else {
      localStorage.removeItem('currentServiceId');
    }
  }, [currentServiceId]);

  const loading = roleLoading || requestsLoading;

  const requestService = async (info: ServiceInfo) => {
    if (!user) return;
    
    const requestData = {
      customer_name: user.user_metadata?.display_name || user.email || '사용자',
      technician_name: info.technicianName,
      service_type: info.serviceType,
      location: info.location,
      scheduled_date: info.scheduledDate.toISOString().split('T')[0],
      scheduled_time: info.scheduledTime,
    };

    const { data, error } = await createRequest(requestData);
    
    if (!error && data) {
      setServiceInfo(info);
      setStatus('pending');
      setCurrentServiceId(data.id);
    }
  };

  const acceptService = () => {
    setStatus('reserved');
  };

  const rejectService = () => {
    setServiceInfo(null);
    setStatus('idle');
  };

  const startMonitoring = () => {
    if (serviceInfo) {
      setServiceInfo({ ...serviceInfo, startTime: new Date() });
    }
    setStatus('monitoring');
  };

  const endMonitoring = async () => {
    setStatus('completed');
    
    if (currentServiceId) {
      await updateRequest(currentServiceId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    }
  };

  const triggerEmergency = async () => {
    setEmergencyTriggered(true);
    
    // Create emergency alert in database if there's an active monitoring session
    if (currentServiceId && user) {
      try {
        await supabase
          .from('emergency_alerts')
          .insert({
            monitoring_session_id: currentServiceId, // This would need proper monitoring session ID
            customer_id: user.id,
            technician_id: user.id, // This would need proper technician ID
            alert_type: 'emergency',
            location: serviceInfo?.location || '위치 정보 없음'
          });
      } catch (error) {
        console.error('Error creating emergency alert:', error);
      }
    }
  };

  const loginAs = (type: UserType) => {
    setUserType(type);
  };

  const logout = () => {
    setUserType(null);
    resetService();
  };

  const resetService = () => {
    setServiceInfo(null);
    setStatus('idle');
    setEmergencyTriggered(false);
    setCurrentServiceId(null);
    setUserType(null);
    localStorage.removeItem('serviceStatus');
    localStorage.removeItem('serviceInfo');
    localStorage.removeItem('emergencyTriggered');
    localStorage.removeItem('currentServiceId');
    localStorage.removeItem('userType');
  };

  const acceptServiceRequest = async (requestId: string) => {
    const result = await updateRequest(requestId, {
      status: 'accepted',
      technician_id: user?.id || null
    });
    
    // Update local state regardless of database update result
    const request = requests.find(req => req.id === requestId);
    if (request) {
      setCurrentServiceId(requestId);
      setServiceInfo({
        technicianName: request.technician_name || '',
        serviceType: request.service_type,
        scheduledDate: new Date(request.scheduled_date),
        scheduledTime: request.scheduled_time,
        location: request.location
      });
      setStatus('accepted');
      setStatusChangeFlags(prev => ({ ...prev, [`accepted_${requestId}`]: true }));
    }
    
    return result;
  };

  const rejectServiceRequest = async (requestId: string) => {
    await updateRequest(requestId, { status: 'rejected' });
    setStatusChangeFlags(prev => ({ ...prev, [`rejected_${requestId}`]: true }));
  };

  const clearStatusChangeFlag = (flag: string) => {
    setStatusChangeFlags(prev => {
      const newFlags = { ...prev };
      delete newFlags[flag];
      return newFlags;
    });
  };

  const getCurrentRequest = () => {
    if (!currentServiceId) return null;
    return requests.find(req => req.id === currentServiceId) || null;
  };

  return (
    <ServiceContext.Provider value={{
      status,
      serviceInfo,
      emergencyTriggered,
      userType,
      serviceRequests: requests,
      currentServiceId,
      statusChangeFlags,
      requestService,
      acceptService,
      rejectService,
      startMonitoring,
      endMonitoring,
      triggerEmergency,
      resetService,
      loginAs,
      logout,
      acceptServiceRequest,
      rejectServiceRequest,
      getCurrentRequest,
      clearStatusChangeFlag,
      loading,
    }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};