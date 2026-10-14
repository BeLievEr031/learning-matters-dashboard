# Teacher Portal & Academic Workspace — Phase-Wise Implementation Plan

> **Target Directory:** `/media/sandy/New Volume/learning-matters/admins-frontend`  
> **Backend Reference:** `/media/sandy/New Volume/learning-matters/server/src/modules/teachers/teachers.routes.ts`  
> **Scope:** Deprecate/hide existing admin screens for the `teacher` and `class_teacher` roles; engineer a dedicated, state-of-the-art Teacher Workspace UI backed by the new Teacher `/me` endpoints and Chapter Materials/Notes APIs.

---

## 1. Executive Summary & Context

### 1.1 The Objective
Previously, the `teacher` and `class_teacher` roles were granted read/limited access to administrative screens (`/boards`, `/grades`, `/subjects`, `/teachers`, `/assignments`). These screens were designed for school admins and principals to perform high-level resource administration, not for faculty to conduct day-to-day academic workflows.

This plan details the complete strategy to:
1. **Remove / Hide Old UI:** Completely dissociate the `teacher` and `class_teacher` roles from existing admin management screens in the sidebar, router, and role guards.
2. **Build New Teacher UI:** Construct a modern, intuitive, role-tailored academic portal driven by the newly implemented teacher-centric backend APIs (`/api/v1/teachers/me/*`) and the associated chapter learning resources (`/api/v1/chapters/:chapterId/materials` & `notes`).

---

## 2. API Contract Specification (The New Teacher & Chapter APIs)

The new UI strictly integrates with the following backend endpoints:

### 2.1 Teacher Context Endpoints (`/api/v1/teachers/me/*`)

| Method | Endpoint | Description | Response Model |
|---|---|---|---|
| `GET` | `/api/v1/teachers/me/grades` | Retrieves all grades/sections assigned to the authenticated teacher. | `Array<{ id, name, code, gradeNumber, section, boardId, boardName, isClassTeacher, totalAssignedSubjects }>` |
| `GET` | `/api/v1/teachers/me/subjects` | Retrieves all distinct subjects assigned to the teacher across all grades. | `Array<{ id, name, code, description, status, totalChapters }>` |
| `GET` | `/api/v1/teachers/me/grades/:gradeId/subjects` | Retrieves subjects assigned to the teacher within a specific grade. | `{ grade: { id, name }, subjects: Array<{ id, name, code, description, assignmentId, effectiveDate, status, totalChapters }> }` |
| `GET` | `/api/v1/teachers/me/subjects/:subjectId/chapters` | Retrieves active syllabus chapters for an assigned subject with counts. | `{ subject: { id, name, code }, chapters: Array<{ id, chapterNumber, title, description, status, totalMaterials, totalNotes }> }` |
| `GET` | `/api/v1/teachers/:teacherId/grades` | Retrieves assigned grades for a teacher (supports admin and own-teacher lookup). | `Array<AssignedGrade>` |

### 2.2 Chapter Learning Resources Endpoints (`/api/v1/chapters/:chapterId/*`)

| Method | Endpoint | Description | Payload / Notes |
|---|---|---|---|
| `GET` | `/api/v1/chapters/:chapterId/materials` | Lists learning materials (PDFs, slide decks, media). | Query: `type`, `limit`, `cursor`, `search` |
| `POST` | `/api/v1/chapters/:chapterId/materials` | Uploads a new material file or external link. | `multipart/form-data`: `file`, `title`, `type`, `description`, `externalUrl` |
| `DELETE` | `/api/v1/chapters/:chapterId/materials/:materialId` | Soft-deletes a material item. | Param: `chapterId`, `materialId` |
| `GET` | `/api/v1/chapters/:chapterId/notes` | Lists teacher & class study notes. | Query: `limit`, `cursor`, `search` |
| `POST` | `/api/v1/chapters/:chapterId/notes` | Publishes a study note with optional file attachment. | `multipart/form-data`: `file`, `title`, `content` |
| `PATCH` | `/api/v1/chapters/:chapterId/notes/:noteId` | Updates note title, content, or attachment. | `multipart/form-data`: `title`, `content`, `file` |
| `DELETE` | `/api/v1/chapters/:chapterId/notes/:noteId` | Soft-deletes a study note. | Param: `chapterId`, `noteId` |

---

## 3. UI/UX Architecture & Navigation Hierarchy

### 3.1 Role Access Matrix Adjustments

| Screen ID | Path | Old Access | New Access | Action Required |
|---|---|---|---|---|
| `dashboard` | `/dashboard` | All Roles | All Roles (Teacher view modernized) | Refactor `TeacherDashboard.tsx` to link to new teacher screens |
| `boards` | `/boards` | super_admin, admin, principal, class_teacher, teacher | `super_admin`, `admin`, `principal` | **Remove** `class_teacher`, `teacher` |
| `grades` | `/grades` | super_admin, admin, principal, class_teacher, teacher | `super_admin`, `admin`, `principal` | **Remove** `class_teacher`, `teacher` |
| `subjects` | `/subjects` | super_admin, admin, principal, class_teacher, teacher | `super_admin`, `admin`, `principal` | **Remove** `class_teacher`, `teacher` |
| `teachers` | `/teachers` | super_admin, admin, principal, class_teacher, teacher | `super_admin`, `admin`, `principal` | **Remove** `class_teacher`, `teacher` |
| `assignments` | `/assignments` | super_admin, admin, principal, class_teacher, teacher | `super_admin`, `admin`, `principal` | **Remove** `class_teacher`, `teacher` |
| **`teacher-classes`** *(NEW)* | `/teacher/classes` | *New* | `teacher`, `class_teacher` | **Add** to registry (Category: `academic`, icon: `Layers`) |
| **`teacher-grade-subjects`** *(NEW)* | `/teacher/classes/:gradeId/subjects` | *New* | `teacher`, `class_teacher` | **Add** to registry (Drill-down screen, hidden from sidebar) |
| **`teacher-subjects`** *(NEW)* | `/teacher/subjects` | *New* | `teacher`, `class_teacher` | **Add** to registry (Category: `academic`, icon: `GraduationCap`) |
| **`teacher-subject-chapters`** *(NEW)* | `/teacher/subjects/:subjectId/chapters` | *New* | `teacher`, `class_teacher` | **Add** to registry (Drill-down screen, hidden from sidebar) |
| **`teacher-chapter-resources`** *(NEW)* | `/teacher/chapters/:chapterId/resources` | *New* | `teacher`, `class_teacher` | **Add** to registry (Materials & Notes workspace) |

### 3.2 Visual & Interaction Flow Diagram

```
                    ┌─────────────────────────┐
                    │    Teacher Logs In      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Teacher Dashboard      │
                    │  (/dashboard)           │
                    │  • KPI Cards            │
                    │  • Class Leads / Stats  │
                    │  • Quick Shortcuts      │
                    └────────────┬────────────┘
                                 │
            ┌────────────────────┴────────────────────┐
            ▼                                         ▼
┌───────────────────────────┐             ┌───────────────────────────┐
│ My Assigned Classes       │             │ My Assigned Subjects      │
│ (/teacher/classes)        │             │ (/teacher/subjects)       │
│ • Grade cards & badges    │             │ • Subject list & codes    │
│ • Class Teacher indicator │             │ • Total chapters count    │
└───────────┬───────────────┘             └───────────┬───────────────┘
            │                                         │
            ▼ Click Class                             ▼ Click Subject
┌───────────────────────────┐                         │
│ Grade Subjects Roster     │                         │
│ (/teacher/classes/:id/sub)│                         │
│ • Subjects in this grade  │                         │
│ • Assignment effective dt │                         │
└───────────┬───────────────┘                         │
            │                                         │
            └────────────────────┬────────────────────┘
                                 │
                                 ▼ Select Chapter / Curriculum
                    ┌───────────────────────────┐
                    │ Subject Syllabus Chapters │
                    │ (/teacher/subjects/:id/ch)│
                    │ • Chapter numbering       │
                    │ • Status & Descriptions   │
                    │ • Material & Note Counts  │
                    └────────────┬──────────────┘
                                 │
                                 ▼ Manage Resources
                    ┌───────────────────────────┐
                    │ Chapter Resource Studio   │
                    │ (/teacher/chapters/:id)   │
                    │ ┌───────────────────────┐ │
                    │ │ Tab 1: Materials (PDF,│ │
                    │ │ links, presentations) │ │
                    │ ├───────────────────────┤ │
                    │ │ Tab 2: Study Notes    │ │
                    │ │ (rich text, uploads)  │ │
                    │ └───────────────────────┘ │
                    └───────────────────────────┘
```

---

## 4. Phase-Wise Implementation Roadmap

```
Phase 1: Screen Registry Deprecation & Navigation Cleanup
Phase 2: TypeScript Interfaces & Typed API Client Integration
Phase 3: TanStack Query Data Fetching Hooks
Phase 4: Teacher Dashboard Revamp (`/dashboard`)
Phase 5: My Assigned Classes (`/teacher/classes`) & Grade Curriculum Views
Phase 6: My Subjects (`/teacher/subjects`) & Chapters Syllabus Viewer
Phase 7: Chapter Learning Resources & Notes Studio (Uploads & Previews)
Phase 8: Polish, Design System Aesthetics, Error States & Mobile UX
Phase 9: Comprehensive Testing & End-to-End Verification
```

---

### Phase 1: Screen Registry Deprecation & Navigation Cleanup
**Goal:** Remove the existing admin UI screens from the teacher's navigation, sidebar, and route permissions so teachers no longer see or access screens meant for administrators.

#### Deliverables & Implementation Tasks:
1. **Update `screens.config.ts` (`admins-frontend/src/config/screens.config.ts`):**
   - In `boards` screen: Change `allowedRoles` to `['super_admin', 'admin', 'principal']`.
   - In `grades` screen: Change `allowedRoles` to `['super_admin', 'admin', 'principal']`.
   - In `subjects` screen: Change `allowedRoles` to `['super_admin', 'admin', 'principal']`.
   - In `teachers` screen: Change `allowedRoles` to `['super_admin', 'admin', 'principal']`.
   - In `assignments` screen: Change `allowedRoles` to `['super_admin', 'admin', 'principal']`.
2. **Register New Teacher Workspace Screens in `screens.config.ts`:**
   - `teacher-classes` (`/teacher/classes`): Title "My Classes", icon `Layers`, Category `academic`, `allowedRoles: ['teacher', 'class_teacher']`, `showInSidebar: true`.
   - `teacher-subjects` (`/teacher/subjects`): Title "My Subjects", icon `GraduationCap`, Category `academic`, `allowedRoles: ['teacher', 'class_teacher']`, `showInSidebar: true`.
   - `teacher-grade-subjects` (`/teacher/classes/:gradeId/subjects`): Title "Grade Curriculum", `allowedRoles: ['teacher', 'class_teacher']`, `showInSidebar: false`.
   - `teacher-subject-chapters` (`/teacher/subjects/:subjectId/chapters`): Title "Subject Chapters", `allowedRoles: ['teacher', 'class_teacher']`, `showInSidebar: false`.
   - `teacher-chapter-resources` (`/teacher/chapters/:chapterId/resources`): Title "Chapter Resources", `allowedRoles: ['teacher', 'class_teacher']`, `showInSidebar: false`.
3. **Verify Route Protection:**
   - Confirm that if a logged-in teacher attempts to browse directly to `/grades`, `/boards`, or `/teachers`, the `<RoleGuard>` seamlessly blocks access and displays the 403 Forbidden screen or redirects gracefully.

---

### Phase 2: TypeScript Interfaces & Typed API Client Integration
**Goal:** Create strong TypeScript data models and API client functions matching the backend response and request payloads.

#### Deliverables & Implementation Tasks:
1. **Create `src/types/teacher-workspace.types.ts`:**
   - `AssignedGrade`:
     ```typescript
     export interface AssignedGrade {
       id: string;
       name: string;
       code: string;
       gradeNumber: number;
       section: string;
       boardId: string;
       boardName: string;
       isClassTeacher: boolean;
       totalAssignedSubjects: number;
     }
     ```
   - `AssignedSubject`:
     ```typescript
     export interface AssignedSubject {
       id: string;
       name: string;
       code: string;
       description?: string | null;
       assignmentId?: string;
       effectiveDate?: string | null;
       status: 'active' | 'inactive';
       totalChapters: number;
     }
     ```
   - `AssignedChapter`:
     ```typescript
     export interface AssignedChapter {
       id: string;
       chapterNumber: number;
       title: string;
       description?: string | null;
       status: 'active' | 'inactive';
       totalMaterials: number;
       totalNotes: number;
     }
     ```
   - `ChapterMaterial` & `ChapterNote` types covering file metadata, mime-types, file sizes, author IDs, and created timestamps.
2. **Extend `src/api/teachers.api.ts`:**
   - `getMyAssignedGrades()`: `GET /teachers/me/grades`
   - `getMyAllAssignedSubjects()`: `GET /teachers/me/subjects`
   - `getMyAssignedGradeSubjects(gradeId: string)`: `GET /teachers/me/grades/${gradeId}/subjects`
   - `getMyAssignedSubjectChapters(subjectId: string)`: `GET /teachers/me/subjects/${subjectId}/chapters`
3. **Create `src/api/chapter-resources.api.ts`:**
   - `listMaterials(chapterId: string, params?)`: `GET /chapters/${chapterId}/materials`
   - `createMaterial(chapterId: string, formData: FormData)`: `POST /chapters/${chapterId}/materials`
   - `deleteMaterial(chapterId: string, materialId: string)`: `DELETE /chapters/${chapterId}/materials/${materialId}`
   - `listNotes(chapterId: string, params?)`: `GET /chapters/${chapterId}/notes`
   - `createNote(chapterId: string, formData: FormData)`: `POST /chapters/${chapterId}/notes`
   - `updateNote(chapterId: string, noteId: string, formData: FormData)`: `PATCH /chapters/${chapterId}/notes/${noteId}`
   - `deleteNote(chapterId: string, noteId: string)`: `DELETE /chapters/${chapterId}/notes/${noteId}`

---

### Phase 3: TanStack Query Data Fetching Hooks
**Goal:** Encapsulate server state caching, invalidation, loading states, and mutations in reusable React hooks.

#### Deliverables & Implementation Tasks:
1. **Create `src/hooks/use-teacher-workspace.ts`:**
   - `useTeacherGrades()`: Query key `['teacher', 'grades']` with 5-minute stale time.
   - `useTeacherSubjects()`: Query key `['teacher', 'subjects']`.
   - `useTeacherGradeSubjects(gradeId: string)`: Query key `['teacher', 'grade-subjects', gradeId]`.
   - `useTeacherSubjectChapters(subjectId: string)`: Query key `['teacher', 'subject-chapters', subjectId]`.
2. **Create `src/hooks/use-chapter-resources.ts`:**
   - `useChapterMaterials(chapterId: string)` & `useChapterNotes(chapterId: string)`
   - `useCreateMaterialMutation()`: Automatically invalidates `['teacher', 'materials', chapterId]` and updates chapter resource counts.
   - `useDeleteMaterialMutation()`: Optimistic removal with toast confirmation.
   - `useCreateNoteMutation()`, `useUpdateNoteMutation()`, and `useDeleteNoteMutation()`.

---

### Phase 4: Teacher Dashboard Revamp (`/dashboard`)
**Goal:** Upgrade `TeacherDashboard.tsx` to display live statistics computed from the new teacher endpoints, replacing placeholders and dead links.

#### Deliverables & Implementation Tasks:
1. **Live Metrics Cards:**
   - **Total Classes / Sections:** Live count of assigned grades from `/teachers/me/grades`.
   - **Assigned Courses:** Live count of subjects taught across grades from `/teachers/me/subjects`.
   - **Curriculum Chapters:** Aggregate chapter count ready for instruction.
   - **Class Teacher Spotlight:** Visual banner if `isClassTeacher: true` highlighting their lead grade and section with quick roster actions.
2. **Quick Access Cards:**
   - "My Assigned Classes" card linking to `/teacher/classes`.
   - "My Subjects & Syllabus" card linking to `/teacher/subjects`.
   - Recent chapter uploads & notes stream.
3. **Empty States & First-Time Onboarding:**
   - Polished empty state when a teacher has no assignments yet, instructing them to contact the school administrator.

---

### Phase 5: My Assigned Classes (`/teacher/classes`) & Grade Curriculum Views
**Goal:** Build the primary classroom view displaying grades assigned to the teacher and enabling drill-down into subjects taught per class.

#### Deliverables & Implementation Tasks:
1. **Create `src/pages/teacher/TeacherClassesPage.tsx` (`/teacher/classes`):**
   - Grid layout of Grade Cards:
     - Grade Number and Section Pill (e.g., "Grade 10 - A").
     - Board badge (e.g., "CBSE", "ICSE").
     - Class Lead Badge (amber shimmer with star/sparkle icon if `isClassTeacher === true`).
     - Total assigned subjects counter badge.
     - Search and filter bar (by grade level or section).
     - "View Curriculum" primary action button navigating to `/teacher/classes/:gradeId/subjects`.
2. **Create `src/pages/teacher/GradeSubjectsPage.tsx` (`/teacher/classes/:gradeId/subjects`):**
   - Header with breadcrumbs (`My Classes > Grade 10 - Section A`).
   - Grade metadata overview card.
   - Interactive subject table / cards displaying:
     - Subject Name & Code (e.g. `Mathematics (MATH101)`).
     - Subject Description.
     - Assignment Effective Date.
     - Total Syllabus Chapters count badge.
     - "Open Syllabus & Chapters" button navigating directly to `/teacher/subjects/:subjectId/chapters`.

---

### Phase 6: My Subjects (`/teacher/subjects`) & Chapters Syllabus Viewer
**Goal:** Provide an overarching academic subject catalog of all disciplines taught by the faculty member and detailed chapter listings.

#### Deliverables & Implementation Tasks:
1. **Create `src/pages/teacher/TeacherSubjectsPage.tsx` (`/teacher/subjects`):**
   - Lists all distinct subjects assigned across all grades.
   - Search by subject name or code.
   - Card stats showing active chapters.
   - One-click navigation to the chapters viewer.
2. **Create `src/pages/teacher/SubjectChaptersPage.tsx` (`/teacher/subjects/:subjectId/chapters`):**
   - Subject header with code, name, and total chapters counter.
   - Chronological Chapters List sorted by `chapterNumber`:
     - Chapter index badge (`Chapter 01`, `Chapter 02`).
     - Chapter Title and Description.
     - Status indicator (`Active`).
     - Resource Badges: Material count (`X files`), Notes count (`Y notes`).
     - Action button: "Manage Resources & Notes" navigating to `/teacher/chapters/:chapterId/resources` or opening an inline drawer.

---

### Phase 7: Chapter Learning Resources & Notes Studio
**Goal:** Provide an interactive workspace for teachers to upload, organize, and view chapter learning materials and lecture notes.

#### Deliverables & Implementation Tasks:
1. **Create `src/pages/teacher/ChapterResourcesPage.tsx` (`/teacher/chapters/:chapterId/resources`):**
   - Dual-tabbed studio:
     - **Tab 1: Learning Materials:**
       - File upload dropzone supporting PDF, Word, PowerPoint, Images, and Web Links.
       - Metadata inputs: Title, Type (`document`, `presentation`, `video`, `link`), Description.
       - Materials grid: File icon, title, size/type, upload date, download link, delete button.
     - **Tab 2: Study Notes:**
       - Create Note Drawer / Dialog: Note Title, Rich Text / Markdown Content, optional file attachment.
       - Notes stream: Formatted preview, expand/collapse, edit modal, delete confirmation.
2. **Upload Progress & Optimistic Feedback:**
   - Upload progress bar, error handling, and Sonner success toasts.

---

### Phase 8: Polish, Design System Aesthetics, Error States & Mobile UX
**Goal:** Ensure the teacher interface adheres to the highest design standards with dark/light mode harmony, glassmorphism, fluid micro-interactions, and mobile responsiveness.

#### Deliverables & Implementation Tasks:
1. **Design System & Aesthetics:**
   - Consistent modern styling using Tailwind CSS v4 variables.
   - Animated tab transitions and card hover lifts.
   - Shimmer skeleton loaders during data fetching (`useQuery`).
2. **Empty & Error States:**
   - Friendly SVG illustrations for: "No subjects assigned", "No materials uploaded yet", "No active chapters found".
3. **Responsive Mobile Experience:**
   - Mobile bottom drawer navigation and swipeable tab headers for tablet and mobile devices.

---

### Phase 9: Comprehensive Testing & End-to-End Verification
**Goal:** Verify complete feature readiness, RBAC security, API contract compliance, and regression safety.

#### Verification Matrix:

| Test Case | Scenario | Expected Outcome |
|---|---|---|
| **RBAC Isolation** | Log in as `teacher` or `class_teacher` | `/boards`, `/grades`, `/teachers`, `/assignments` are absent from sidebar; direct URL access triggers 403 Forbidden. |
| **New Navigation** | Log in as `teacher` | Sidebar displays "My Classes" (`/teacher/classes`) and "My Subjects" (`/teacher/subjects`). |
| **Grades Retrieval** | Navigate to `/teacher/classes` | Successfully calls `GET /api/v1/teachers/me/grades`; displays grade cards with `isClassTeacher` badge. |
| **Grade Drill-down** | Click a grade card | Navigates to `/teacher/classes/:id/subjects`; calls `GET /api/v1/teachers/me/grades/:id/subjects`. |
| **Subjects Retrieval** | Navigate to `/teacher/subjects` | Calls `GET /api/v1/teachers/me/subjects`; displays distinct subjects and chapter counts. |
| **Chapters Viewer** | Click a subject | Calls `GET /api/v1/teachers/me/subjects/:id/chapters`; lists chapters with material/note counts. |
| **Materials CRUD** | Upload PDF material to a chapter | Calls `POST /api/v1/chapters/:id/materials`; updates list and material count badge. |
| **Notes CRUD** | Create note for a chapter | Calls `POST /api/v1/chapters/:id/notes`; renders note card; updates note count. |
| **Admin Regression** | Log in as `admin` or `super_admin` | All existing admin screens (`/schools`, `/grades`, `/teachers`, `/assignments`) function with zero regression. |

---

## 5. Summary of Files to Modify & Create

### Files to Modify:
1. `src/config/screens.config.ts`: Update role permissions for admin screens (remove `teacher`, `class_teacher`); register new teacher routes.
2. `src/api/teachers.api.ts`: Add `getMyAssignedGrades`, `getMyAllAssignedSubjects`, `getMyAssignedGradeSubjects`, `getMyAssignedSubjectChapters`.
3. `src/pages/dashboard/components/TeacherDashboard.tsx`: Connect live data and link to new teacher routes.

### Files to Create:
1. `src/types/teacher-workspace.types.ts`: TypeScript data models for teacher grades, subjects, chapters, materials, and notes.
2. `src/api/chapter-resources.api.ts`: API client functions for chapter materials and notes CRUD.
3. `src/hooks/use-teacher-workspace.ts`: TanStack Query hooks for teacher grades, subjects, and chapters.
4. `src/hooks/use-chapter-resources.ts`: TanStack Query hooks and mutations for materials and notes.
5. `src/pages/teacher/TeacherClassesPage.tsx`: Primary assigned classes & grades directory.
6. `src/pages/teacher/GradeSubjectsPage.tsx`: Subjects taught within a specific grade.
7. `src/pages/teacher/TeacherSubjectsPage.tsx`: All assigned subjects catalogue.
8. `src/pages/teacher/SubjectChaptersPage.tsx`: Chapters and syllabus units viewer.
9. `src/pages/teacher/ChapterResourcesPage.tsx`: Study materials & lecture notes interactive studio.
