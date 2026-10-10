# Learning Matters Admin Portal — Frontend Phase-Wise Development Plan

> **Target Directory:** `/media/sandy/New Volume/learning-matters/admins-frontend`  
> **Backend API:** Express 5 / Node.js 22 Multi-Tenant REST API at `http://localhost:3000/api/v1`  
> **Frontend Stack:** React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · Shadcn UI / Base UI · TanStack Query · React Router · Zustand · Zod · Lucide Icons

---

## 1. System & Architectural Vision

The Admin Portal is a multi-tenant, role-aware administration web application for schools, boards, staff, students, and system administrators. It integrates seamlessly with the backend REST API developed in `/media/sandy/New Volume/learning-matters/server`.

### Primary Design Pillars
1. **Dynamic, Config-Driven Screen & Role Registry:**
   - Screens are **not** hardcoded into router switch blocks.
   - Every screen is registered in a central registry (`screens.config.ts`) declaring route path, icon, required roles, required permissions, navigation category, and lazy-loaded component.
   - **Adding or removing a screen for any role in the future is a one-line config change**, requiring zero routing refactoring.
2. **Multi-Tenant Context Awareness:**
   - `super_admin`: Global access across all schools with an active School Switcher in the top navigation bar.
   - School-Scoped Roles (`admin`, `principal`, `class_teacher`, `teacher`, `student`): Scoped strictly to their assigned `schoolId` with automated header injection and UI guard rails.
3. **Role Impersonation & Preview (Dev/Admin Sandbox):**
   - Built-in "View As Role" switcher for super admins to test how any screen renders for each role.
4. **Resilient Data Fetching & Sync:**
   - TanStack Query with optimistic updates, cursor pagination handling, and centralized caching.
   - Axios / Fetch client with automatic refresh token rotation queue (preventing multiple simultaneous refresh calls).
5. **Modern, Polished Aesthetics:**
   - Tailwind CSS v4, dark/light theme support, glassmorphism accents, skeleton loaders, and interactive toast feedback (Sonner).

---

## 2. Role Hierarchy & Screen Access Matrix

The system implements the 6 backend roles:

```
super_admin (System-wide — all schools)
  └─ admin (Single school administrator)
       └─ principal (School principal — read-heavy, approval, overview)
            └─ class_teacher (Class teacher — assigned grade & section)
                 └─ teacher (Subject teacher — assigned courses)
                      └─ student (Self-service profile and enrollments)
```

### Initial Access Matrix

| Screen / Module | Path | `super_admin` | `admin` | `principal` | `class_teacher` | `teacher` | `student` |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** | `/dashboard` | ✅ Global | ✅ School | ✅ School | ✅ Grade | ✅ My Classes | ✅ My Profile |
| **Schools Directory** | `/schools` | ✅ Full CRUD | ❌ | ❌ | ❌ | ❌ | ❌ |
| **School Profile** | `/schools/:id` | ✅ Full | ✅ My School | 👁️ Read | ❌ | ❌ | ❌ |
| **Boards & Academics** | `/boards` | ✅ Full | ✅ Full | 👁️ Read | 👁️ Read | 👁️ Read | ❌ |
| **Grades & Sections** | `/grades` | ✅ Full | ✅ Full | ✅ Assign Class Teacher | 👁️ My Grade | 👁️ Read | ❌ |
| **Subjects Catalogue** | `/subjects` | ✅ Full | ✅ Full | 👁️ Read | 👁️ Read | 👁️ Read | ❌ |
| **Teachers & Staff** | `/teachers` | ✅ Full | ✅ Full | 👁️ Read | 👁️ Read | 👁️ Colleagues | ❌ |
| **Students & Admissions** | `/students` | ✅ Full | ✅ Full | 👁️ Read + Transfer | 👁️ My Grade | ❌ | ❌ |
| **Teacher Assignments** | `/assignments` | ✅ Full | ✅ Full | ✅ Assign/Manage | 👁️ Read | 👁️ My Schedule | ❌ |
| **Principals** | `/principals` | ✅ Full | ✅ Appoint | 👁️ Profile | ❌ | ❌ | ❌ |
| **User Accounts** | `/users` | ✅ Full | ✅ School Users | ❌ | ❌ | ❌ | ❌ |
| **Audit Logs** | `/audit-logs` | ✅ Full System | ✅ School Logs | 👁️ School Logs | ❌ | ❌ | ❌ |
| **My Profile** | `/profile` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Role & Screen Manager** | `/settings/screens` | ✅ | ✅ (Configurable) | ❌ | ❌ | ❌ | ❌ |

---

## 3. Dynamic Screen Registry Architecture

### Screen Definition Schema (`src/config/screens.config.ts`)

```typescript
export interface ScreenDefinition {
  id: string;                         // Unique ID (e.g. 'students-directory')
  path: string;                       // Route path (e.g. '/students')
  title: string;                      // Display title
  description?: string;               // Help text / tooltip
  icon: LucideIconName;               // Icon for navigation
  category: 'core' | 'academic' | 'people' | 'administration' | 'system';
  allowedRoles: UserRole[];           // Roles permitted to view this screen
  requiredPermissions?: string[];     // Fine-grained permission codes
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  showInSidebar: boolean;             // Visible in main navigation
  badge?: () => string | number | null; // Optional dynamic badge
  order: number;                      // Sidebar sort order
}
```

### Future-Proofing Mechanism
- **Adding a new screen:** Create the page component and append one object to `screens.config.ts`.
- **Modifying access:** Update `allowedRoles` array in `screens.config.ts` or toggle it dynamically via the runtime Role Matrix UI.
- **Dynamic Route Generation:** The top-level router reads the active user role, filters the registry, and mounts matching `<Route>` elements wrapped with `<RoleGuard>`.
- **Dynamic Sidebar:** The sidebar navigation automatically aggregates permitted screens grouped by category.

---

## 4. Phase-Wise Development Breakdown

```
Phase 0: Project Foundations & Infrastructure Setup ✅
  ├── Dependencies & tooling (router, query, axios, zustand, sonner)
  ├── Path aliases & Tailwind v4 styling setup
  └── Theme Provider (Dark / Light) & Base UI components

Phase 1: API Client, Authentication Store & Screen Registry ✅
  ├── Typed Axios / Fetch Client with JWT Auto-Refresh Queue
  ├── Zustand Auth & Session Store (tokens, user, activeSchoolId)
  ├── Declarative Screen Registry (`screens.config.ts`)
  └── Route Guards (`RoleGuard`, `AuthGuard`, `GuestGuard`)

Phase 2: Authentication & Session Screens ✅
  ├── Modern Login Screen (Email/Password, Remember Me, Show/Hide)
  ├── Session hydration via `GET /api/v1/auth/me`
  ├── Logout & Logout-All confirmation dialogs
  └── Session expired & refresh failure interceptors

Phase 3: App Shell, Sidebar, Navigation & Header ✅
  ├── Responsive Dashboard Shell Layout
  ├── Dynamic Sidebar driven by Role Screen Registry
  ├── Multi-Tenant School Context Switcher (for `super_admin`)
  ├── Command Palette (`Cmd+K`) for fast screen search
  └── Header bar with notifications, theme toggle, and user profile drawer

Phase 4: Dashboard Overview (Role-Tailored)
  ├── Super Admin view (Total schools, active users, system health)
  ├── School Admin / Principal view (Student count, teacher count, grades, quick actions)
  └── Teacher / Class Teacher view (My schedule, assigned grade, students count)

Phase 5: Schools Management (`super_admin` only)
  ├── Schools list table with cursor-based pagination, search, status filter
  ├── Create School modal/drawer with validation
  ├── Edit School & Logo upload / URL support
  └── School status transitions (`active`, `inactive`, `suspended`) and soft delete

Phase 6: Boards & Academic Curriculum Management
  ├── School-scoped Boards directory (CBSE, ICSE, etc.)
  ├── Add/Edit Board modal with code uniqueness checks
  └── Board status management and grade counts

Phase 7: Grades & Sections Management
  ├── Grades & Sections list with board filtering and section grouping
  ├── Create Grade modal (gradeNumber, section, capacity)
  ├── Class Teacher assignment / unassignment modal (`PUT /grades/:id/class-teacher`)
  └── Grade capacity and student occupancy indicators

Phase 8: Subjects & Grade-Subject Curriculum
  ├── Master Subjects catalogue with search & code filter
  ├── Create & Edit subject drawer
  ├── Grade-Subject mapping manager (`/grades/:gradeId/subjects`)
  └── Association status toggle (`active`, `inactive`)

Phase 9: Teachers & Staff Directory
  ├── Teachers list with employee ID, qualifications, joining date, and status
  ├── Add Teacher form with optional user account linkage
  ├── Teacher profile view drawer
  └── Status transitions (`active`, `inactive`, `on_leave`, `terminated`)

Phase 10: Students & Admissions Management
  ├── Students directory with grade, board, and admission number filters
  ├── Admission Form (personal info, guardian contacts, DOB, gender)
  ├── Student profile details drawer
  ├── Student Grade Transfer modal (`PUT /students/:id/transfer` with audit reason)
  └── Student status lifecycle (`active`, `inactive`, `transferred`, `graduated`, `suspended`)

Phase 11: Teacher Assignments Matrix (Scheduling)
  ├── Interactive Teacher ↔ Grade ↔ Subject assignment grid & table
  ├── Create Assignment modal with teacher and subject conflict validation
  ├── Assignment effective date and status management
  └── Teacher workload visualization

Phase 12: Principal Appointment & Management
  ├── Principal profile card per school
  ├── Appoint / Replace Principal modal (`POST /schools/:id/principal`)
  └── Principal status and contact details manager

Phase 13: User Administration & RBAC Management
  ├── System-wide / School-scoped Users list with role filters
  ├── Create User modal (role assignment: super_admin, admin, principal, teacher, student)
  ├── User status toggle (`active`, `inactive`)
  └── Password reset / credential invitation trigger

Phase 14: Audit Logs & Compliance Trail Viewer
  ├── Live audit logs table with actor, role, school, action, and resource filters
  ├── Visual JSON Diff viewer for state changes
  └── Audit log export / inspection view

Phase 15: Role-to-Screen Customization & Impersonation Sandbox
  ├── Screen Visibility Matrix settings UI (allow admins to toggle screen visibility per role)
  ├── "View As Role" Impersonation Sandbox for testing UI per role
  └── LocalStorage / API persistence of custom screen permissions

Phase 16: Polish, Testing, Performance & Mobile Responsiveness
  ├── Mobile responsive drawer sidebar & touch navigation
  ├── Skeleton loaders, empty state illustrations, error boundary fallbacks
  ├── Optimistic UI updates with Sonner toast feedback
  └── Production bundle optimization, code-splitting, and Lighthouse verification
```

---

## 5. Directory Structure (Target)

```
admins-frontend/
├── src/
│   ├── api/                     # API client & backend endpoint integrations
│   │   ├── client.ts            # Axios instance with JWT refresh queue
│   │   ├── auth.api.ts          # Login, logout, refresh, me
│   │   ├── schools.api.ts       # Schools CRUD & status
│   │   ├── boards.api.ts        # Boards CRUD & status
│   │   ├── grades.api.ts        # Grades CRUD & class teacher assignment
│   │   ├── subjects.api.ts      # Subjects & Grade-Subjects CRUD
│   │   ├── teachers.api.ts      # Teachers CRUD & status
│   │   ├── students.api.ts      # Students CRUD, transfer & status
│   │   ├── assignments.api.ts   # Teacher assignments CRUD
│   │   ├── principals.api.ts    # Principals management
│   │   ├── users.api.api.ts     # User management
│   │   └── audit-logs.api.ts    # Audit logs querying
│   ├── config/
│   │   ├── screens.config.ts    # Central Screen & Role Registry
│   │   └── env.ts               # Environment variables (API base URL)
│   ├── store/
│   │   ├── auth.store.ts        # Auth session, user profile, tokens
│   │   ├── school.store.ts      # Active school context for super_admin
│   │   └── theme.store.ts       # Dark / Light theme mode
│   ├── components/
│   │   ├── ui/                  # Shadcn / Base UI primitives (button, dialog, input, etc.)
│   │   ├── layout/              # Shell, Sidebar, Header, Breadcrumbs, CommandMenu
│   │   ├── guards/              # RoleGuard, AuthGuard, GuestGuard
│   │   ├── feedback/            # Toast (Sonner), LoadingSkeletons, EmptyState, ErrorBoundary
│   │   └── common/              # DataTable, PaginationControls, StatusBadge, SchoolSelector
│   ├── pages/
│   │   ├── auth/                # Login, ForgotPassword
│   │   ├── dashboard/           # Role-tailored dashboards
│   │   ├── schools/             # Schools list, details, forms
│   │   ├── boards/              # Boards list, forms
│   │   ├── grades/              # Grades list, forms, class-teacher assignment
│   │   ├── subjects/            # Subjects & Grade-subjects catalogue
│   │   ├── teachers/            # Teachers list, details, forms
│   │   ├── students/            # Students list, admissions, transfer modal
│   │   ├── assignments/         # Teacher assignments matrix
│   │   ├── principals/          # Principal appointment
│   │   ├── users/               # Users management
│   │   ├── audit-logs/          # Audit logs table & diff viewer
│   │   ├── settings/            # Screen Role Matrix customization
│   │   └── errors/              # 401, 403, 404, 500 error pages
│   ├── hooks/
│   │   ├── use-auth.ts          # Auth state & permissions helper
│   │   ├── use-screens.ts       # Filtered accessible screens hook
│   │   └── use-api-query.ts     # TanStack query wrapper with toast integration
│   ├── types/
│   │   ├── auth.types.ts        # UserRole, AuthenticatedUser, Tokens
│   │   ├── screens.types.ts     # ScreenDefinition, Category, NavigationItem
│   │   └── api.types.ts         # PaginatedResponse, ApiErrorResponse, Entities
│   ├── App.tsx                  # Root App with QueryClient, Router, Toaster
│   ├── main.tsx                 # React DOM root entrypoint
│   └── index.css                # Tailwind CSS v4 & theme variables
├── FRONTEND_PHASE_WISE_DEVELOPMENT_PLAN.md
├── package.json
└── vite.config.ts
```

---

## 6. Dependencies to Install in Phase 0

```bash
# Core routing & server state management
npm install react-router-dom @tanstack/react-query axios zustand

# Form validation & controls
npm install react-hook-form @hookform/resolvers zod

# UI utilities & Feedback
npm install sonner clsx tailwind-merge
```

---

## 7. Execution Approval Gate

Before beginning code implementation in `/media/sandy/New Volume/learning-matters/admins-frontend`:
- [ ] Review and confirm this Phase-Wise Development Plan.
- [ ] Confirm order of phases or any custom screen priorities.
- [ ] Upon confirmation, we will start with **Phase 0 (Foundations, dependencies, and Tailwind v4 setup)** followed by **Phase 1 (API Client, Auth Store, and Dynamic Screen Registry)**.
