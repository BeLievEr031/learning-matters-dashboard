import type { ScreenDefinition, ScreenCategory, CategoryMetadata } from '../types/screens.types.ts';
import type { UserRole } from '../types/auth.types.ts';

// Page components
import { DashboardPage } from '../pages/dashboard/DashboardPage.tsx';
import { SchoolsPage } from '../pages/schools/SchoolsPage.tsx';
import { BoardsPage } from '../pages/boards/BoardsPage.tsx';
import { GradesPage } from '../pages/grades/GradesPage.tsx';
import { SubjectsPage } from '../pages/subjects/SubjectsPage.tsx';
import { TeachersPage } from '../pages/teachers/TeachersPage.tsx';
import { StudentsPage } from '../pages/students/StudentsPage.tsx';
import { AssignmentsPage } from '../pages/assignments/AssignmentsPage.tsx';
import { PrincipalsPage } from '../pages/principals/PrincipalsPage.tsx';
import { UsersPage } from '../pages/users/UsersPage.tsx';
import { AuditLogsPage } from '../pages/audit-logs/AuditLogsPage.tsx';
import { ScreenSettingsPage } from '../pages/settings/ScreenSettingsPage.tsx';
import { ProfilePage } from '../pages/profile/ProfilePage.tsx';

// Teacher Workspace components
import { TeacherClassesPage } from '../pages/teacher/TeacherClassesPage.tsx';
import { GradeSubjectsPage } from '../pages/teacher/GradeSubjectsPage.tsx';
import { TeacherSubjectsPage } from '../pages/teacher/TeacherSubjectsPage.tsx';
import { SubjectChaptersPage } from '../pages/teacher/SubjectChaptersPage.tsx';
import { ChapterResourcesPage } from '../pages/teacher/ChapterResourcesPage.tsx';

export const CATEGORIES: Record<ScreenCategory, CategoryMetadata> = {
  core: { id: 'core', label: 'Overview', order: 1 },
  academic: { id: 'academic', label: 'Academic Structure', order: 2 },
  people: { id: 'people', label: 'Faculty & Students', order: 3 },
  administration: { id: 'administration', label: 'Administration', order: 4 },
  system: { id: 'system', label: 'System & Security', order: 5 },
};

/**
 * MASTER SCREEN REGISTRY
 *
 * To add a new screen in the future:
 * 1. Create the page component in `src/pages/`
 * 2. Add a new ScreenDefinition object to this array
 *
 * The router, sidebar navigation, breadcrumbs, command palette (Cmd+K),
 * and role-based route guards will adapt automatically.
 */
export const SCREENS_REGISTRY: ScreenDefinition[] = [
  // Core
  {
    id: 'dashboard',
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Overview KPIs and quick actions',
    iconName: 'LayoutDashboard',
    category: 'core',
    allowedRoles: ['super_admin', 'admin', 'principal', 'class_teacher', 'teacher', 'student'],
    component: DashboardPage,
    showInSidebar: true,
    order: 10,
  },
  {
    id: 'profile',
    path: '/profile',
    title: 'My Profile',
    description: 'Personal profile and account settings',
    iconName: 'UserCircle',
    category: 'core',
    allowedRoles: ['super_admin', 'admin', 'principal', 'class_teacher', 'teacher', 'student'],
    component: ProfilePage,
    showInSidebar: true,
    order: 20,
  },

  // Academic Structure (Admin / Leadership)
  {
    id: 'boards',
    path: '/boards',
    title: 'Boards',
    description: 'Curriculum boards (CBSE, ICSE, State Boards)',
    iconName: 'BookOpen',
    category: 'academic',
    allowedRoles: ['super_admin', 'admin', 'principal'],
    component: BoardsPage,
    showInSidebar: true,
    order: 10,
  },
  {
    id: 'grades',
    path: '/grades',
    title: 'Grades & Sections',
    description: 'Manage grade levels, sections, and class teachers',
    iconName: 'Layers',
    category: 'academic',
    allowedRoles: ['super_admin', 'admin', 'principal'],
    component: GradesPage,
    showInSidebar: true,
    order: 20,
  },
  {
    id: 'subjects',
    path: '/subjects',
    title: 'Subjects',
    description: 'Master courses catalogue and grade curriculum',
    iconName: 'GraduationCap',
    category: 'academic',
    allowedRoles: ['super_admin', 'admin', 'principal'],
    component: SubjectsPage,
    showInSidebar: true,
    order: 30,
  },

  // Teacher Workspace (Faculty & Class Leads)
  {
    id: 'teacher-classes',
    path: '/teacher/classes',
    title: 'My Classes',
    description: 'Assigned grades, sections, and class lead responsibilities',
    iconName: 'Layers',
    category: 'academic',
    allowedRoles: ['class_teacher', 'teacher'],
    component: TeacherClassesPage,
    showInSidebar: true,
    order: 5,
  },
  {
    id: 'teacher-grade-subjects',
    path: '/teacher/classes/:gradeId/subjects',
    title: 'Grade Curriculum',
    description: 'Subjects taught within selected class grade',
    iconName: 'BookOpen',
    category: 'academic',
    allowedRoles: ['class_teacher', 'teacher'],
    component: GradeSubjectsPage,
    showInSidebar: false,
    order: 6,
  },
  {
    id: 'teacher-subjects',
    path: '/teacher/subjects',
    title: 'My Subjects',
    description: 'Master courses catalog and syllabus overview',
    iconName: 'GraduationCap',
    category: 'academic',
    allowedRoles: ['class_teacher', 'teacher'],
    component: TeacherSubjectsPage,
    showInSidebar: true,
    order: 7,
  },
  {
    id: 'teacher-subject-chapters',
    path: '/teacher/subjects/:subjectId/chapters',
    title: 'Subject Chapters',
    description: 'Syllabus units and lesson breakdown',
    iconName: 'BookOpen',
    category: 'academic',
    allowedRoles: ['class_teacher', 'teacher'],
    component: SubjectChaptersPage,
    showInSidebar: false,
    order: 8,
  },
  {
    id: 'teacher-chapter-resources',
    path: '/teacher/chapters/:chapterId/resources',
    title: 'Chapter Resources',
    description: 'Learning materials and study notes studio',
    iconName: 'FileText',
    category: 'academic',
    allowedRoles: ['class_teacher', 'teacher'],
    component: ChapterResourcesPage,
    showInSidebar: false,
    order: 9,
  },

  // People (Faculty & Students - Admin / Leadership)
  {
    id: 'teachers',
    path: '/teachers',
    title: 'Teachers',
    description: 'Teacher staff directory and employee records',
    iconName: 'Briefcase',
    category: 'people',
    allowedRoles: ['super_admin', 'admin', 'principal'],
    component: TeachersPage,
    showInSidebar: true,
    order: 10,
  },
  {
    id: 'students',
    path: '/students',
    title: 'Students',
    description: 'Student admissions, enrollment, and transfers',
    iconName: 'Users',
    category: 'people',
    allowedRoles: ['super_admin', 'admin', 'principal', 'class_teacher'],
    component: StudentsPage,
    showInSidebar: true,
    order: 20,
  },
  {
    id: 'assignments',
    path: '/assignments',
    title: 'Teacher Assignments',
    description: 'Teacher to grade and subject scheduling matrix',
    iconName: 'CalendarCheck',
    category: 'people',
    allowedRoles: ['super_admin', 'admin', 'principal'],
    component: AssignmentsPage,
    showInSidebar: true,
    order: 30,
  },

  // Administration
  {
    id: 'schools',
    path: '/schools',
    title: 'Schools',
    description: 'Multi-tenant school institutions and operational status',
    iconName: 'Building2',
    category: 'administration',
    allowedRoles: ['super_admin'],
    component: SchoolsPage,
    showInSidebar: true,
    order: 10,
  },
  {
    id: 'principals',
    path: '/principals',
    title: 'Principals',
    description: 'School principal appointments and records',
    iconName: 'Award',
    category: 'administration',
    allowedRoles: ['super_admin', 'admin', 'principal'],
    component: PrincipalsPage,
    showInSidebar: true,
    order: 20,
  },
  {
    id: 'users',
    path: '/users',
    title: 'User Accounts',
    description: 'System credentials, role assignments, and statuses',
    iconName: 'UserCheck',
    category: 'administration',
    allowedRoles: ['super_admin', 'admin'],
    component: UsersPage,
    showInSidebar: true,
    order: 30,
  },

  // System & Security
  {
    id: 'audit-logs',
    path: '/audit-logs',
    title: 'Audit Logs',
    description: 'Security audit trail and state diff history',
    iconName: 'History',
    category: 'system',
    allowedRoles: ['super_admin', 'admin', 'principal'],
    component: AuditLogsPage,
    showInSidebar: true,
    order: 10,
  },
  {
    id: 'screen-settings',
    path: '/settings/screens',
    title: 'Screen Role Matrix',
    description: 'Configure and preview screen visibility per role',
    iconName: 'Sliders',
    category: 'system',
    allowedRoles: ['super_admin', 'admin'],
    component: ScreenSettingsPage,
    showInSidebar: true,
    order: 20,
  },
];

/**
 * Filter all screens permitted for a given role.
 */
export function getAccessibleScreens(role: UserRole): ScreenDefinition[] {
  return SCREENS_REGISTRY.filter((screen) => screen.allowedRoles.includes(role));
}

/**
 * Filter sidebar items grouped by category for a given role.
 */
export function getSidebarNavigation(role: UserRole): Array<{
  category: CategoryMetadata;
  screens: ScreenDefinition[];
}> {
  const accessible = getAccessibleScreens(role).filter((s) => s.showInSidebar);

  const categories = Object.values(CATEGORIES).sort((a, b) => a.order - b.order);

  return categories
    .map((category) => ({
      category,
      screens: accessible
        .filter((s) => s.category === category.id)
        .sort((a, b) => a.order - b.order),
    }))
    .filter((group) => group.screens.length > 0);
}

/**
 * Check if a specific screen ID is accessible by role.
 */
export function isScreenAccessible(screenId: string, role: UserRole): boolean {
  const screen = SCREENS_REGISTRY.find((s) => s.id === screenId);
  return screen ? screen.allowedRoles.includes(role) : false;
}

/**
 * Check if a route path is accessible by role.
 */
export function isPathAccessible(path: string, role: UserRole): boolean {
  const screen = SCREENS_REGISTRY.find((s) => s.path === path);
  return screen ? screen.allowedRoles.includes(role) : false;
}

/**
 * Lookup screen definition by path.
 */
export function getScreenByPath(path: string): ScreenDefinition | undefined {
  return SCREENS_REGISTRY.find((s) => s.path === path);
}
