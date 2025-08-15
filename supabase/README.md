# Supabase 데이터베이스 설정 가이드

## 마이그레이션 파일

### 1. 기본 테이블 (20250813073605-.sql)
- `profiles`: 사용자 프로필 정보
- `safety_partners`: 안전 파트너 연락처
- `service_requests`: 서비스 요청
- `monitoring_sessions`: 모니터링 세션
- `emergency_alerts`: 긴급 알림

### 2. 역할 기반 구조 (20250813090000-add-user-roles.sql)
- `user_roles`: 사용자 역할 관리 (customer, technician, admin)
- `technicians`: 기술인 전용 정보
- `service_reviews`: 서비스 리뷰 및 평점

## 테스트 데이터 설정

### 1. 마이그레이션 실행
Supabase Dashboard에서:
1. SQL Editor 탭으로 이동
2. 각 마이그레이션 파일을 순서대로 실행:
   - `20250813073605-.sql`
   - `20250813073702-.sql`
   - `20250813090000-add-user-roles.sql`

### 2. 테스트 데이터 삽입

#### 방법 1: Auth를 통한 사용자 생성 (권장)
```sql
-- Supabase Dashboard의 Authentication > Users에서 직접 생성
-- 또는 앱의 /db-test 페이지에서 "테스트 사용자 추가" 버튼 클릭
```

#### 방법 2: seed.sql 파일 사용
```sql
-- 먼저 테스트 사용자를 Auth에 생성한 후
-- seed.sql의 UUID를 실제 생성된 사용자 ID로 교체
-- 그 다음 seed.sql 실행
```

### 3. 테스트 사용자 계정

테스트를 위한 샘플 계정 생성 예시:
- 고객1: customer1@mytestapp.com / costomer1
- 고객2:
- 기술인1: tech1@mytestapp.com / tech1
- 기술인2: 

## 데이터베이스 연결 테스트

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `/db-test` 경로로 이동
3. 연결 상태 및 테이블 통계 확인

## 주요 기능

### 사용자 역할 구분
- **Customer**: 일반 사용자, 서비스 요청 가능
- **Technician**: 기술인, 서비스 제공 및 프로필 관리
- **Admin**: 관리자, 전체 시스템 관리

### 기술인 프로필 관리
- 전문 분야 (specialties)
- 평점 시스템 (자동 계산)
- 서비스 지역
- 자격증 정보
- 시간당 요금

### Row Level Security (RLS)
모든 테이블에 RLS가 활성화되어 있어 사용자별 권한 관리가 자동으로 이루어집니다.

## 문제 해결

### 연결 실패 시
1. Supabase 프로젝트 URL 확인
2. Anon Key 확인
3. RLS 정책 확인

### 데이터가 보이지 않을 때
1. RLS 정책 확인
2. 사용자 인증 상태 확인
3. 테이블 권한 확인