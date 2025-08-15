-- Seed data for testing
-- This file contains test data for development and testing purposes

-- First, create test users in auth.users (this needs to be done via Supabase Auth API)
-- For now, we'll assume these users exist with the following IDs:
-- customer1: 11111111-1111-1111-1111-111111111111
-- customer2: 22222222-2222-2222-2222-222222222222
-- customer3: 33333333-3333-3333-3333-333333333333
-- technician1: 44444444-4444-4444-4444-444444444444
-- technician2: 55555555-5555-5555-5555-555555555555

-- Insert user roles
INSERT INTO public.user_roles (user_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'customer'),
  ('22222222-2222-2222-2222-222222222222', 'customer'),
  ('33333333-3333-3333-3333-333333333333', 'customer'),
  ('44444444-4444-4444-4444-444444444444', 'technician'),
  ('55555555-5555-5555-5555-555555555555', 'technician')
ON CONFLICT (user_id) DO NOTHING;

-- Insert profiles
INSERT INTO public.profiles (user_id, display_name, phone_number, avatar_url) VALUES
  ('11111111-1111-1111-1111-111111111111', '아이린', '010-1234-5678', 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer1'),
  ('22222222-2222-2222-2222-222222222222', '웬디', '010-2345-6789', 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer2'),
  ('33333333-3333-3333-3333-333333333333', '조이', '010-3456-7890', 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer3'),
  ('44444444-4444-4444-4444-444444444444', '서우테', '010-4567-8901', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech1'),
  ('55555555-5555-5555-5555-555555555555', '서울시', '010-5678-9012', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech2')
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  phone_number = EXCLUDED.phone_number,
  avatar_url = EXCLUDED.avatar_url;

-- Insert technician profiles
INSERT INTO public.technicians (user_id, specialties, rating, total_services, service_areas, certifications, is_available, bio, hourly_rate) VALUES
  ('44444444-4444-4444-4444-444444444444', 
   ARRAY['전기', '배관', 'HVAC'], 
   4.5, 
   125, 
   ARRAY['서울', '경기'], 
   '[{"name": "전기기능사", "date": "2020-03-15"}, {"name": "가스기능사", "date": "2021-06-20"}]'::jsonb,
   true,
   '10년 경력의 전문 기술자입니다. 신속하고 정확한 서비스를 제공합니다.',
   50000),
  ('55555555-5555-5555-5555-555555555555', 
   ARRAY['가전제품', '청소', '통신'], 
   4.8, 
   89, 
   ARRAY['서울', '인천'], 
   '[{"name": "에어컨 수리 및 청소 경력", "date": "2019-11-10"}, {"name": "네트워크관리사", "date": "2020-08-25"}]'::jsonb,
   true,
   '모든 가전제품 및 통신 기기 문제를 해결해드립니다.',
   60000)
ON CONFLICT (user_id) DO UPDATE SET
  specialties = EXCLUDED.specialties,
  rating = EXCLUDED.rating,
  total_services = EXCLUDED.total_services,
  service_areas = EXCLUDED.service_areas,
  certifications = EXCLUDED.certifications,
  is_available = EXCLUDED.is_available,
  bio = EXCLUDED.bio,
  hourly_rate = EXCLUDED.hourly_rate;

-- Insert safety partners
INSERT INTO public.safety_partners (user_id, name, phone_number, relationship, is_primary) VALUES
  ('11111111-1111-1111-1111-111111111111', '김안전', '010-1111-1111', '배우자', true),
  ('11111111-1111-1111-1111-111111111111', '김부모', '010-1111-2222', '부모', false),
  ('22222222-2222-2222-2222-222222222222', '이보호', '010-2222-1111', '친구', true),
  ('33333333-3333-3333-3333-333333333333', '박가족', '010-3333-1111', '형제', true)
ON CONFLICT DO NOTHING;

-- Insert service requests with various statuses
INSERT INTO public.service_requests (
  customer_id, 
  technician_id, 
  customer_name, 
  technician_name, 
  service_type, 
  location, 
  scheduled_date, 
  scheduled_time, 
  status,
  created_at
) VALUES
  -- Pending request
  ('11111111-1111-1111-1111-111111111111', 
   '44444444-4444-4444-4444-444444444444', 
   '아이린', 
   '서우테', 
   '전기 수리', 
   '서울시 강남구 테헤란로 123', 
   CURRENT_DATE + INTERVAL '2 days', 
   '14:00', 
   'pending',
   NOW() - INTERVAL '1 hour'),
   
  -- Accepted request
  ('22222222-2222-2222-2222-222222222222', 
   '55555555-5555-5555-5555-555555555555', 
   '웬디', 
   '서울시', 
   '에어컨 청소', 
   '서울시 서초구 서초대로 456', 
   CURRENT_DATE + INTERVAL '1 day', 
   '10:00', 
   'accepted',
   NOW() - INTERVAL '3 hours'),
   
  -- Monitoring request
  ('33333333-3333-3333-3333-333333333333', 
   '44444444-4444-4444-4444-444444444444', 
   '조이', 
   '서우테', 
   '에어컨 설치', 
   '경기도 성남시 분당구 789', 
   CURRENT_DATE, 
   '15:00', 
   'monitoring',
   NOW() - INTERVAL '5 hours'),
   
  -- Completed request
  ('11111111-1111-1111-1111-111111111111', 
   '55555555-5555-5555-5555-555555555555', 
   '아이린', 
   '서울시', 
   '인터넷 설치', 
   '서울시 강남구 테헤란로 123', 
   CURRENT_DATE - INTERVAL '3 days', 
   '11:00', 
   'completed',
   NOW() - INTERVAL '4 days'),
   
  -- Another pending request
  ('22222222-2222-2222-2222-222222222222', 
   NULL, 
   '웬디', 
   NULL, 
   '보일러 점검', 
   '서울시 서초구 서초대로 456', 
   CURRENT_DATE + INTERVAL '5 days', 
   '09:00', 
   'pending',
   NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- Update completed_at for completed service
UPDATE public.service_requests 
SET completed_at = NOW() - INTERVAL '3 days',
    start_time = (CURRENT_DATE - INTERVAL '3 days')::timestamp + TIME '11:00'
WHERE status = 'completed';

-- Update start_time for monitoring service
UPDATE public.service_requests 
SET start_time = CURRENT_DATE::timestamp + TIME '15:00'
WHERE status = 'monitoring';

-- Insert monitoring session for the monitoring service request
INSERT INTO public.monitoring_sessions (
  service_request_id,
  customer_id,
  technician_id,
  status
)
SELECT 
  id,
  customer_id,
  technician_id,
  'active'
FROM public.service_requests
WHERE status = 'monitoring'
ON CONFLICT DO NOTHING;

-- Insert a service review for completed service
INSERT INTO public.service_reviews (
  service_request_id,
  customer_id,
  technician_id,
  rating,
  comment
)
SELECT 
  id,
  customer_id,
  technician_id,
  5,
  '매우 친절하고 전문적인 서비스였습니다. 강력 추천합니다!'
FROM public.service_requests
WHERE status = 'completed'
  AND customer_id = '11111111-1111-1111-1111-111111111111'
  AND technician_id = '55555555-5555-5555-5555-555555555555'
ON CONFLICT DO NOTHING;

-- Output summary
SELECT 'Test data seeding completed!' AS message;
SELECT 'Users created: ' || COUNT(*) AS count FROM public.profiles;
SELECT 'Technicians created: ' || COUNT(*) AS count FROM public.technicians;
SELECT 'Service requests created: ' || COUNT(*) AS count FROM public.service_requests;
SELECT 'Safety partners created: ' || COUNT(*) AS count FROM public.safety_partners;