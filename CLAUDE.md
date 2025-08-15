# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server on port 8080
npm run build      # Build for production
npm run build:dev  # Build for development
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Installation
```bash
npm i              # Install dependencies
```

## Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router v6
- **Backend**: Supabase (BaaS)
- **State Management**: React Context API (AuthContext, ServiceContext)
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation

### Project Structure

The application follows a standard React SPA structure:

- **`/src/pages/`**: Route components for each screen
  - Auth flow: `Splash` → `Onboarding` → `Auth`/`PassAuth` → `Home`
  - Service flow: `ServiceRequest` → `Matching` → `SafeCam`
  - Technician flow: `TechnicianDashboard` → `Technician` → `TechnicianCamera`
  
- **`/src/components/ui/`**: shadcn/ui component library (pre-built, reusable components)

- **`/src/contexts/`**: Global state management
  - `AuthContext`: User authentication state and methods
  - `ServiceContext`: Service request state management

- **`/src/integrations/supabase/`**: Database integration
  - `client.ts`: Supabase client configuration
  - `types.ts`: Auto-generated TypeScript types from database schema

- **`/src/hooks/`**: Custom React hooks
  - `useSupabaseData`: Data fetching from Supabase
  - `use-toast`: Toast notification system

### Routing Strategy

The app uses React Router with the following main routes:
- Authentication routes: `/`, `/onboarding`, `/auth`, `/pass-auth`
- User routes: `/home`, `/service-request`, `/matching`, `/safe-cam`, `/profile`
- Technician routes: `/technician`, `/technician/service/:serviceId`, `/technician/camera/:serviceId`

### TypeScript Configuration

- Path alias: `@/*` maps to `./src/*`
- Relaxed type checking enabled (noImplicitAny: false, strictNullChecks: false)

### Key Dependencies

- UI Components: Radix UI primitives wrapped by shadcn/ui
- Animations: Tailwind CSS animate, Framer Motion (via vaul)
- Date handling: date-fns
- Icons: lucide-react
- Notifications: sonner (toast notifications)

### Supabase Integration

The project connects to a Supabase backend with:
- Database migrations in `/supabase/migrations/`
- Configuration in `/supabase/config.toml`
- TypeScript types auto-generated from database schema

### Development Notes

- The project was initially created with Lovable.dev platform
- Component tagger is used in development mode for debugging
- The development server runs on port 8080 with IPv6 support (`::`)