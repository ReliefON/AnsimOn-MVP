// Extended types for new database tables
// This file supplements the auto-generated types.ts file

import { Database } from './types';

// User role types
export type UserRole = 'customer' | 'technician' | 'admin';

export type UserRoleRow = {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

// Technician profile types
export type TechnicianProfile = {
  id: string;
  user_id: string;
  specialties: string[];
  rating: number;
  total_services: number;
  service_areas: string[];
  certifications: Certification[];
  is_available: boolean;
  bio?: string;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
};

export type Certification = {
  name: string;
  date: string;
};

// Service review types
export type ServiceReview = {
  id: string;
  service_request_id: string;
  customer_id: string;
  technician_id: string;
  rating: number;
  comment?: string;
  created_at: string;
};

// Extended service request type with relations
export type ServiceRequestWithRelations = Database['public']['Tables']['service_requests']['Row'] & {
  customer?: Database['public']['Tables']['profiles']['Row'];
  technician?: Database['public']['Tables']['profiles']['Row'];
  technician_profile?: TechnicianProfile;
  review?: ServiceReview;
};

// Helper type for user with role
export type UserWithRole = {
  id: string;
  email?: string;
  profile?: Database['public']['Tables']['profiles']['Row'];
  role?: UserRole;
  technician_profile?: TechnicianProfile;
};